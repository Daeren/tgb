//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");
const baseSrv = require("./internal/baseSrv");

//-----------------------------------------------------

module.exports = polling;

//-----------------------------------------------------

function polling(bot, options, onMessage) {
    if(typeof(options) === "function") {
        onMessage = options;
        options = null;
    }

    //----------------]>

    options = Object.assign({
        "limit":    100,
        "timeout":  0,
        "interval": 2
    }, options || {});

    if(typeof(bot) === "string") {
        bot = client(bot);
        bot.proxy = options.proxy;
    }

    //----------------]>

    const tmInterval = Math.max(Math.trunc(options.interval) || 2, 1) * 1000;

    let tmPolling,

        stopped = false,
        tick = false;

    //----------------]>

    runNextTick();

    //----------------]>

    const instance = baseSrv({
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
        }
    });

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

        bot
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
                            onMessage.call(instance, d, bot);
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
                        bot
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
        instance._watchDog(error);
    }
}
