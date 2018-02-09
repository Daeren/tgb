//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const http = require("http");
const https = require("https");

const events = require("events");

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

class Request extends events {
    get paused() { return this.__pause || false; }
    get aborted() { return this.__aborted || false; }
    get ended() { return this.__ended || false; }


    abort() {
        this.__aborted = true;

        if(req) {
            req.abort();
            req = null;
        }

        if(tunReq) {
            tunReq.abort();
            tunReq = null;
        }

        this.emit("abort");
    }

    resume() {
        this.__pause = false;
        this.emit("resume");
    }

    pause() {
        this.__pause = true;
        this.emit("pause");
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

    let tunReq,
        req;

    const instance = createCallInstance();

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

        tunReq = tunRequest(reqProxyTunOptions, function(response, socket) {
            const statusCode = response.statusCode;

            if(statusCode === 200) {
                reqProxyOptions.path = path;
                reqProxyOptions.socket = socket;

                req = httpsRequest(reqProxyOptions);

                process.nextTick(cbInit, req);
            }
            else {
                const e = new Error(`Proxy | connect.statusCode: ${statusCode}`);
                e.code = "EBADPROXY";
                e.response = response;

                socket.destroy(e);
            }
        });
    }
    else {
        reqOptions.path = path;
        req = httpsRequest(reqOptions);

        process.nextTick(cbInit, req);
    }

    //--------------]>

    return instance;

    //--------------]>

    function createCallInstance() {
        return new Request();
    }

    //-------)>

    function tunRequest(opt, callback) {
        return http
            .request(opt)
            .setTimeout(reqTimeout, onTimeout)
            .on("error", onError)
            .on("abort", obAbort)
            .on("connect", callback)
            .end();
    }

    function httpsRequest(opt) {
        return https
            .request(opt, onResponse)
            .setTimeout(reqTimeout, onTimeout)
            .on("error", onError)
            .on("abort", obAbort);
    }

    //-------)>

    function onResponse(response) {
        let firstChunk, chunks;

        //--------]>

        response
            .on("error", onResponseError)
            .on("data", onResponseData)
            .on("end", onResponseEnd);

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
            instance.__ended = true;
            cbResult(null, chunks ? Buffer.concat(chunks) : firstChunk || null, response);
        }
    }

    function onError(error) {
        if(req) {
            req.destroy();
            req = null;
        }

        if(tunReq) {
            tunReq.destroy();
            tunReq = null;
        }

        cbResult(error, null, null);
    }

    function onTimeout() {
        this.destroy(new Error("Timeout"));
    }

    function obAbort() {
        instance.__aborted = true;
        cbResult(null, null, null);
    }
}

function free() {
    keepAliveAgentHTTP.destroy();
    keepAliveAgentHTTPS.destroy();
}
