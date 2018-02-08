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

    const tmInterval = Math.max(Math.trunc(options.interval) || 2, 2) * 1000;

    let tmPolling;
    let stopped = false;

    //----------------]>

    process.nextTick(load);

    //----------------]>

    return {
        start() {
            if(stopped) {
                stopped = false;
                wait();
            }

            return this;
        },
        stop() {
            stopped = true;
            clearTimeout(tmPolling);

            return this;
        }
    }

    //----------------]>

    function wait() {
        if(!stopped) {
            tmPolling = setTimeout(load, tmInterval);
        }
    }

    function load() {
        if(stopped) {
            return;
        }

        client
            .getUpdates(token, options)
            .then(function(data) {
                if(stopped) {
                    return;
                }

                if(data.length > 0) {
                    data.forEach((d) => {
                        options.offset = d.update_id + 1;
                        onNewMessage(d);
                    });

                    load();
                } else {
                    wait();
                }
            })
            .catch(function(error) {
                switch(error.code) {
                    case client.ERR_USED_WEBHOOK:
                        client.deleteWebhook(token).then(load).catch(wait);
                        break;

                    default:
                        wait();
                }
            });
    }
}
