//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const proto = require("./proto");
const call = require("./call");

//-----------------------------------------------------

const baseClient = {
    "ERR_INTERNAL_SERVER":      500,
    "ERR_NOT_FOUND":            400,
    "ERR_FORBIDDEN":            403,
    "ERR_MESSAGE_LIMITS":       429,
    "ERR_USED_WEBHOOK":         409,
    "ERR_INVALID_TOKEN":        401,

    buffer,
    json
};

//-----------------------------------------------------

class Client extends Function {
    constructor(token) {
        super();

        const func = function(method, data, proxy = func.proxy) {
            return client(func.token, method, data, proxy);
        };

        Object.setPrototypeOf(func, new.target.prototype);
        func.token = token;

        return func;
    }
}

//-----------------------------------------------------

for(let [k, v] of Object.entries(proto)) {
    Client.prototype[k] = function(data, proxy = this.proxy) {
        return client(this.token, k, data, proxy);
    };

    client[k] = function(token, data, proxy) {
        return client(token, k, data, proxy);
    };
}

for(let [k, v] of Object.entries(baseClient)) {
    Client.prototype[k] = v;
}

//-----------------------------------------------------

module.exports = Object.assign(function(token, method, data, proxy) {
    return arguments.length === 1 ? new Client(token) : client(token, method, data, proxy);
}, baseClient);

//-----------------------------------------------------

function client(token, method, data, proxy) {
    let resolve,
        reject;

    //-------]>

    const response = new Promise((res, rej) => { resolve = res, reject = rej; });
    const request = json(proxy, token, method, data, onEnd);

    //------------]>

    response.request = request;
    response[Symbol.iterator] = function *() {
        yield response;
        yield request;
    };

    //------------]>

    return response;

    //------------]>

    function onEnd(error, data, response) {
        if(error) {
            reject(error);
        }
        else {
            if(data) {
                if(data.ok) {
                    resolve(data.result);
                }
                else {
                    const error = new Error(data.description);

                    error.code = data.error_code;
                    error.response = response;

                    if(data.parameters) {
                        error.parameters = data.parameters;

                        error.retryAfter = data.parameters.retry_after;
                        error.migrateToChatId = data.parameters.migrate_to_chat_id;
                    }

                    reject(error);
                }
            }
            else {
                resolve(data);
            }
        }
    }
}

//-----------------------------------------------------

function buffer() {
    return call.apply(call, arguments);
}

function json(proxy, token, method, data, callback) {
    return call(proxy, token, method, data, onEnd);

    //-------------]>

    function onEnd(error, data, response) {
        if(data) {
            const isJson = response.headers["content-type"] === "application/json";

            if(isJson) {
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    error = e;
                }
            }
            else {
                error = new Error(`Expected JSON (${response.statusCode})`);
            }

            if(error) {
                error.code = "EBADDATA";
                error.response = response;
                error.data = data;

                data = null;
            }
        }
        else if(!data && response) {
            error = new Error(`Expected JSON (${response.statusCode})`);

            error.code = "EBADDATA";
            error.response = response;
        }

        callback(error, data, response);
    }
}
