//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const http = require("http");
const https = require("https");

const EE = require("events");

const {
    cbNoop,
    once
} = require("./tools");

//-----------------------------------------------------

const keepAliveAgentHTTP = new http.Agent({"keepAlive": true});
const keepAliveAgentHTTPS = new https.Agent({"keepAlive": true});

const reqTimeout = 1000 * 60 * 2;

const reqOptions = {
    "path":       null,
    "method":     "POST",

    "host":       "api.telegram.org",
    "port":       443,

    "agent":      keepAliveAgentHTTPS
};

const reqProxyTunOptions = {
    "host":     null,
    "port":     null,

    "method":   "CONNECT",
    "path":     "api.telegram.org:443",

    "agent":    keepAliveAgentHTTP
};

const reqProxyOptions = {
    "path":       null,
    "method":     "POST",

    "host":       "api.telegram.org",
    "port":       443,

    "agent":      false
};

//-----------------------------------------------------

let proxyAddressCache = NaN;

//-----------------------------------------------------

class Request extends EE {
    constructor() {
        super();
        this.autoEnd = true;
    }


    get paused() { return this.__pause || false; }
    get aborted() { return this.__aborted || false; }
    get ended() { return this.__ended || false; }
    get finished() { return this.__finished || false; }


    end() {
        if(!this.__aborted && !this.__ended) {
            this.__end();
            this.__ended = true;
        }
    }

    abort() {
        if(!this.__aborted && !this.__ended) {
            this.__abort();
            this.__aborted = Date.now();

            this.__pause = false;
        }
    }

    resume() {
        if(!this.__aborted && !this.__ended) {
            this.__pause = false;
            this.emit("resume");
        }
    }

    pause() {
        if(!this.__aborted && !this.__ended) {
            this.__pause = true;
            this.emit("pause");
        }
    }


    __destroy(error) {
        if(this.__req) {
            this.__req.destroy(error);
            this.__req = null;
        }

        if(this.__tunReq) {
            this.__tunReq.destroy(error);
            this.__tunReq = null;
        }
    }

    __end() {
        if(this.__req) {
            this.__req.end();
            this.__req = null;
        }

        if(this.__tunReq) {
            this.__tunReq.end();
            this.__tunReq = null;
        }
    }

    __abort() {
        if(this.__req) {
            this.__req.abort();
            this.__req = null;
        }

        if(this.__tunReq) {
            this.__tunReq.abort();
            this.__tunReq = null;
        }
    }
}

//-----------------------------------------------------

module.exports = {
    call,
    free
};

//-----------------------------------------------------

function call(proxy, token, method, cbInit, cbResult) {
    const path = `/bot${token}/${method}`;
    const instance = new Request();

    //--------------]>

    cbResult = once(cbResult || cbNoop);

    //--------------]>

    if(proxy) {
        if(proxyAddressCache !== proxy) {
            if(typeof(proxy) === "string") {
                proxyAddressCache = proxy;
                proxy = proxy.split(":");
            }
            else {
                proxyAddressCache = NaN;
            }

            reqProxyTunOptions.host = proxy.host || proxy[0];
            reqProxyTunOptions.port = proxy.port || proxy[1];
        }

        //-------]>

        instance.__tunReq = tunRequest(reqProxyTunOptions, function(response, socket) {
            const statusCode = response.statusCode;

            if(statusCode === 200) {
                reqProxyOptions.path = path;
                reqProxyOptions.socket = socket;

                process.nextTick(cbInit, instance.__req = httpsRequest(reqProxyOptions));
            }
            else {
                const e = new Error(`Proxy | connect.statusCode: ${statusCode}`);
                e.code = "EBADPROXY";
                e.response = response;

                instance.__destroy(e);
            }
        });
    }
    else {
        reqOptions.path = path;
        process.nextTick(cbInit, instance.__req = httpsRequest(reqOptions));
    }

    //--------------]>

    return instance;

    //--------------]>

    function tunRequest(opt, callback) {
        return http
            .request(opt)
            .setTimeout(reqTimeout, onTimeout)
            .once("error", onError)
            .once("abort", obAbort)
            .once("connect", callback)
            .end();
    }

    function httpsRequest(opt) {
        return https
            .request(opt, onResponse)
            .setTimeout(reqTimeout, onTimeout)
            .once("error", onError)
            .once("abort", obAbort);
    }

    //-------)>

    function onResponse(response) {
        let firstChunk, chunks;

        //--------]>

        response
            .once("aborted", obAbort)
            .once("error", onResponseError)
            .on("data", onResponseData)
            .once("end", onResponseEnd);

        //--------]>

        function onResponseError(error) {
            error.response = response;
            onError(error);
        }

        function onResponseData(chunk) {
            if(!firstChunk) {
                firstChunk = chunk;
            }
            else {
                chunks = chunks || [firstChunk];
                chunks.push(chunk);
            }
        }

        function onResponseEnd() {
            instance.__finished = true;
            cbResult(null, chunks ? Buffer.concat(chunks) : firstChunk || null, response);
        }
    }

    function onError(error) {
        instance.__destroy();
        cbResult(error, null, null);
    }

    function onTimeout() {
        instance.__destroy(new Error("Timeout"));
    }

    function obAbort() {
        instance.abort();
        cbResult(null, null, null);
    }
}

function free() {
    keepAliveAgentHTTP.destroy();
    keepAliveAgentHTTPS.destroy();
}
