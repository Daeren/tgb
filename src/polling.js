//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");

//-----------------------------------------------------

module.exports = polling;

//-----------------------------------------------------

function polling(token, options, onNewMessage) {
    if(typeof(options) === "function") {
        onNewMessage = options;
        options = null;
    }

    //----------------]>

    options = Object.assign({
        "limit":    100,
        "timeout":  0,
        "interval": 2
    }, options || {});

    //----------------]>

    const api = client(token);
    const tmInterval = Math.max(Math.trunc(options.interval) || 2, 1) * 1000;

    let tmPolling,

        stopped = false,
        tick = false;

    //----------------]>

    runNextTick();

    //----------------]>

    const instance = {
        start() {
            if(stopped) {
                stopped = false;
                runNextTick();
            }

            return this;
        },
        stop() {
            stopped = true;
            clearTimeout(tmPolling);

            return this;
        },
        catch(callback) {
            this._watchDog = callback;
            return this;
        }
    };

    //----------------]>

    return instance;

    //----------------]>

    function runNextTick() {
        if(!tick) {
            tick = true;
            process.nextTick(load);
        }
    }

    function wait(moreSlowly) {
        if(!stopped) {
            tmPolling = setTimeout(load, tmInterval + (moreSlowly ? 3000 : 0));
        }
    }

    function load() {
        tick = false;

        if(stopped) {
            return;
        }

        api
            .getUpdates(options)
            .then(function(data) {
                if(stopped) {
                    return;
                }

                if(data.length > 0) {
                    for(let id, d, i = 0, len = data.length; i < len; ++i) {
                        if(stopped) {
                            return;
                        }

                        d = data[i];
                        id = d.update_id;

                        try {
                            onNewMessage.call(instance, d);
                            options.offset = id + 1;
                        } catch(e) {
                            e.data = d;

                            callWatchDog(e);
                            wait(true);

                            return;
                        }
                    }

                    load();
                } else {
                    wait();
                }
            })
            .catch(function(error) {
                switch(error.code) {
                    case client.ERR_USED_WEBHOOK:
                        api
                            .deleteWebhook()
                            .then(load)
                            .catch(function(e) {
                                e.context = error;

                                callWatchDog(e);
                                wait(true);
                            });

                        break;

                    default:
                        callWatchDog(error);
                        wait(true);
                }
            });
    }

    function callWatchDog(error) {
        if(instance._watchDog) {
            instance._watchDog(error);
        }
    }
}
