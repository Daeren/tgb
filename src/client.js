//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const proto = require("./proto");
const call = require("./call");

//-----------------------------------------------------

for(let [k, v] of Object.entries(proto)) {
    client[k] = function(token, data, proxy) {
        return client(token, k, data, proxy);
    };
}

//-----------------------------------------------------

module.exports = Object.assign(client, {
    "ERR_INTERNAL_SERVER":      500,
    "ERR_NOT_FOUND":            400,
    "ERR_FORBIDDEN":            403,
    "ERR_MESSAGE_LIMITS":       429,
    "ERR_USED_WEBHOOK":         409,
    "ERR_INVALID_TOKEN":        401,

    buffer,
    json,

    proto
});

//-----------------------------------------------------

function client(token, method, data, proxy) {
    let resolve,
        reject;

    //-------]>

    const response = new Promise((res, rej) => { resolve = res, reject = rej; });
    const request = json(proxy, token, method, data, onEnd);

    //------------]>

    request.request = request;
    request[Symbol.iterator] = function* () {
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
