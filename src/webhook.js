//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const http = require("http");
const https = require("https");

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {URL} = require("url");

const {
    isHttps
} = require("./tools");

const baseSrv = require("./internal/baseSrv");

//-----------------------------------------------------

module.exports = webhook;

//-----------------------------------------------------

function webhook(port, options) {
    if(port && typeof(port) === "object") {
        options = port;
        port = null;
    }

    options = Object.assign({}, options || {});

    if(port) {
        options.port = port;
    }

    options.host = typeof(options.host) === "string" ? options.host : "";
    options.port = parseInt(options.port, 10) || 88;
    options.retryAfter = typeof(options.retryAfter) === "string" ? options.retryAfter : ""; // HTTP header: Retry-After

    //---------]>

    let srv;

    //---------]>

    return new Promise(function(resolve, reject) {
        if(options.ssl) {
            const {ssl} = options;

            const key = fs.readFileSync(path.normalize(ssl.key));
            const cert = fs.readFileSync(path.normalize(ssl.cert));
            const ca = Array.isArray(ssl.ca) ? ssl.ca.map((e) => fs.readFileSync(path.normalize(e))) : ssl.ca;

            //------]>

            srv = https.createServer({
                key, cert, ca,

                "requestCert":          true,
                "rejectUnauthorized":   false
            }, onClient);
        }
        else {
            srv = http.createServer(onClient);
        }

        //---------]>

        const instance = baseSrv({
            "_bots": new Map(),


            set(bot, url, onMessage) {
                url = (new URL(url)).pathname;

                bot.url = url;
                this._bots.set(url, [bot, onMessage]);

                return this;
            },

            delete(url) {
                if(url) {
                    if(typeof(url) === "object") {
                        url = url.url;
                    }

                    const bot = this._bots.get(url);

                    if(bot) {
                        delete bot.url;
                        this._bots.delete(url);
                    }
                }

                return this;
            },


            bind(bot, options, onMessage) {
                if(typeof(options) === "function") {
                    onMessage = options;
                    options = null;
                }
                else if(typeof(options) === "string") {
                    options = {"url": options};
                }

                options = Object.assign({}, options || {});

                //-------]>

                if(options.url) {
                    if(!isHttps(options.url)) {
                        options.url = "https://" + options.url.replace(/^https?:\/\//, "");
                    }

                    //-----]>

                    const u = new URL(options.url);

                    if(!u.port) {
                        u.port = 443;
                    }

                    if(!u.pathname || u.pathname.length === 1) {
                        u.pathname = `/tg_bot_${crypto.createHash("sha256").update(bot.token).digest("hex")}`;
                    }

                    options.url = u.toString();
                }

                //-------]>

                return new Promise((resolve, reject) => {
                    bot
                        .setWebhook(options)
                        .then((isOk) => {
                            if(isOk) {
                                this.set(bot, options.url, onMessage);
                            }

                            resolve(isOk ? options.url : null);
                        })
                        .catch(function(error) {
                            error.url = options.url;
                            reject(error);
						});
                });
            },

            unbind(bot) {
                return new Promise((resolve, reject) => {
                    bot
                        .deleteWebhook()
                        .then((isOk) => {
                            if(isOk) {
                                this.delete(bot);
                            }

                            resolve(isOk ? options.url : null);
                        })
                        .catch(reject);
                });
            },


            close() {
                return new Promise((resolve, reject) => {
                    if(srv) {
                        srv.close((e) => e ? reject(e) : (this._bots.clear(), resolve()));
                    }
                    else {
                        reject(new Error("Not running"));
                    }
                });
            }
        });

        //---------]>

        srv.once("listening", onListening);
        srv.once("error", onErrListen);

        //---------]>

        srv.listen(options.port, options.host);

        //---------]>

        function onClient(request, response) {
            if(request.method !== "POST") {
                end();
                return;
            }

            //-------]>

            let firstChunk, chunks;

            //-------]>

            request
                .on("error", onRequestError)
                .on("data", onRequestData)
                .on("end", onRequestEnd);

            //-------]>

            function onRequestError(error) {
                request.destroy(error);
            }

            function onRequestData(chunk) {
                if(!firstChunk) {
                    firstChunk = chunk;
                }
                else {
                    chunks = chunks || [firstChunk];
                    chunks.push(chunk);
                }
            }

            function onRequestEnd() {
                const bot = instance._bots.get(request.url);

                //--------]>

                if(!bot) {
                    end(400);
                    return;
                }
                else {
                    end();
                }

                //--------]>

                const data = chunks ? Buffer.concat(chunks) : firstChunk;

                let json;

                //--------]>

                try {
                    json = JSON.parse(data);
                } catch(e) {
                    e.code = "EBADDATA";
                    e.data = data;

                    callWatchDog(e);
                    return;
                }

                try {
                    const [b, onMessage] = bot;
                    onMessage.call(b, json, b);
                } catch(e) {
                    e.data = json;

                    callWatchDog(e);
                    return;
                }
            }

            //----)>

            function end(code = 200) {
                const {retryAfter} = options;

                response.writeHead(code);

                if(retryAfter) {
                    response.setHeader("Retry-After", retryAfter);
                }

                response.end();
            }
        }

        function onListening() {
            srv.removeListener("error", onErrListen);

            srv.on("error", function(error) {
                callWatchDog(error);
            });

            srv.on("clientError", function(error, socket) {
                socket.end();
            });

            //-------]>

            instance.host = srv.address().address;
            instance.port = srv.address().port;

            //-------]>

            resolve(instance);
        }
        
        function onErrListen(error) {
            srv.close();
            reject(error);
        }

        //---------]>

        function callWatchDog(error) {
            instance._watchDog(error);
        }
    });
}
