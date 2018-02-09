//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const fs = require("fs");
const path = require("path");

const request = require("./request");
const proto = Object.assign({}, require("./proto"));

const {
    forEachAsync,

    isStream,
    isFsStream,
    isRequestStream,
    isHttp,
    isFilepath,

    getFilenameFromStream,
    getFileExtByMime,
    getWebContent
} = require("./tools");

//-----------------------------------------------------

const reTgUri = /^(tg\+)?https?:\/\//;

const mpPipeOpts = {"end": false};

let mpBoundaryTmUp = 0,
    mpBoundaryKey, mpHeaderContentType,
    mpBoundaryDiv, mpBoundaryEnd,
    mpCRLFBoundaryDiv, mpCRLFBoundaryEnd;

//-----------------------------------------------------

for(let [k, v] of Object.entries(proto)) {
    proto[k.toLowerCase()] = v;
}

//-----------------------------------------------------

module.exports = call;

//-----------------------------------------------------

function call(proxy, token, method, data, callback) {
    if(!token) {
        throw new Error("`token` was not specified");
    }

    if(!method) {
        throw new Error("`method` was not specified");
    }

    //------------]>

    return request.call(proxy, token, method, onReqInit, callback);

    //------------]>

    function onReqInit(request) {
        const dataIsMap = data instanceof(Map);
        const dataIsArray = dataIsMap ? false : Array.isArray(data);
        const dataLen = dataIsArray ? data.length : (dataIsMap ? data.size : -1);

        //-------]>

        if(!data || dataLen === 0) {
            request.end();
            return;
        }

        //-------]>

        const schema = proto[method] || proto[method.toLowerCase()];

        //-------]>

        if(schema === null) {
            request.end();
            return;
        }

        if(!schema) {
            request.destroy(new Error(`Unknown method: "${method}"`));
            return;
        }

        //-------]>

        updateMpBoundary();
        request.setHeader("Content-Type", mpHeaderContentType);

        //-------]>

        const limit = dataIsArray ? Math.min(dataLen, schema.length) : schema.length;
        let count = -1;

        (function nextField() {
            ++count;

            if(count >= limit) {
                request.write(mpCRLFBoundaryEnd);
                uncork(request);
                request.end();
            }
            else {
                const [field, type] = schema[count];
                const input = dataIsMap ? data.get(field) : (dataIsArray ? data[count] : data[field]);

                //-------]>

                if(input == null) {
                    nextField();
                }
                else {
                    cork(request);
                    request.write(makeFieldStr(field));
                    writeData(request, field, type, input, nextField);
                }
            }
        })();
    }

    //-------)>

    function writeData(request, field, type, input, done) {
        switch(type) {
            case "mediaGroup": {
                if(Array.isArray(input) && input.length) {
                    const files = [];

                    //--------]>

                    request.write(JSON.stringify(input, function(k, v) {
                        if(k === "media") {
                            const isUri = v && typeof(v) === "string" ? v.match(reTgUri) : null;
                            const proto = isUri && isUri[0];
                            const useTgUp = isUri && isUri[1];

                            let name;

                            //-------]>

                            if(typeof(v) === "string" && (useTgUp || !isUri && !isFilepath(v))) {
                                return useTgUp ? v.replace("tg+", "") : v;
                            }

                            //-------]>

                            if(isUri) {
                                k = path.parse(v);
                                name = `${files.length}_${Date.now()}_${k.base}`;
                            }
                            else if(isFilepath(v)) {
                                v = path.normalize(v);
                                k = path.parse(v);
                                name = `${files.length}_${k.base}`;
                            }
                            else if(isStream(v)) {
                                name = `${files.length}_${Date.now()}_${getFilenameFromStream(v)}`;
                            }
                            else if(Array.isArray(v)) {
                                k = path.parse(v[0]);
                                name = `${files.length}_${Date.now()}_${k.base}`;
                            }

                            if(name) {
                                files.push([name, v]);
                                return `attach://${name}`;
                            }
                        }

                        return v;
                    }));

                    //--------]>

                    forEachAsync(files, function(next, [name, v], i) {
                        writeData(request, name, input[i].type, v, next);
                    }, done);
                }
                else {
                    done();
                }

                return;
            }

            case "message":
            case "location":
            case "venue":
            case "contact": {
                if(isStream(input)) {
                    uncork(request);
                    sendStreamData(input, request, done);

                    return;
                }
                else {
                    type = "string";
                }

                break;
            }

            case "photo":
            case "audio":
            case "document":
            case "sticker":
            case "video":
            case "voice":
            case "video_note":
            case "certificate": {
                const isUri = input && typeof(input) === "string" ? input.match(reTgUri) : null;
                const proto = isUri && isUri[0];
                const useTgUp = isUri && isUri[1];

                //--------]>

                if(isUri) {
                    if(useTgUp) {
                        input = input.replace("tg+", "");

                        if(type !== "voice" && type !== "video_note") {
                            type = "string";
                            break;
                        }
                    }

                    //-----]>

                    (function load() {
                        const reqWc = getWebContent(input, function(response) {
                            const {statusCode, headers} = response;

                            let error;

                            //-----]>

                            load.attempts = load.attempts || 0;

                            if(statusCode < 200 || statusCode > 399) {
                                error = new Error(`getWebContent | statusCode: ${statusCode}`);
                            }
                            else if(statusCode === 200 && load.attempts >= 5) {
                                error = new Error(`getWebContent | too long | attempts: ${load.attempts}`);
                                error.code = "EWCLONGREDIRECT";
                            }
                            else {
                                const MAX_FILE_SIZE = 1024 * 1024 * 50;

                                const location = headers["location"];
                                const contentLength = headers["content-length"] || 0;

                                if(contentLength > MAX_FILE_SIZE) {
                                    error = new Error(`getWebContent | maxSize: ${contentLength}`);
                                    error.code = "EWCMAXSIZE";
                                }
                                else if(location) {
                                    load.attempts++;
                                    input = location;

                                    reqWc.abort();
                                    load();

                                    return;
                                }
                            }

                            //-----]>

                            if(error) {
                                error.code = error.code || "EBADREQUEST";
                                error.response = response;

                                reqWc.abort();
                                request.destroy(error);
                            }
                            else {
                                input = response;
                                sendFile();
                            }
                        });

                        reqWc.on("error", function(error) {
                            reqWc.abort();
                            request.destroy(error);
                        });
                    })();
                }
                else {
                    if(typeof(input) === "string" && !isFilepath(input)) {
                        type = "string";
                        break;
                    }

                    sendFile();
                }

                //--------]>

                return;
            }
        }

        //-------------]>

        request.write(makeFieldStrValue(type, input));
        done();

        //-------------]>

        function sendFile() {
            uncork(request);

            //-------]>

            if(Array.isArray(input)) {
                const [filename, buf] = input;

                request.write(makeFieldFile(field, filename));
                request.write(buf);

                done();
            }
            else {
                const own = !isStream(input);
                const rs = own ? fs.createReadStream(input) : input;
                const fn = getFilenameFromStream(rs);

                if(own) {
                    rs.on("open", function(error) {
                        request.write(makeFieldFile(field, fn));
                    });
                }
                else {
                    request.write(makeFieldFile(field, fn));
                }

                sendStreamData(rs, request, done);
            }
        }
    }
}

//-----------------------------------------------------

function cork(request) {
    if(!request.corked) {
        const sk = request.socket;

        if(sk) {
            sk.cork();
            request.corked = true;
        }
    }

    return request;
}

function uncork(request, now) {
    if(request.corked) {
        const sk = request.socket;

        if(now) {
            if(sk) {
                sk.uncork();
            }
        }
        else {
            process.nextTick(() => sk && sk.uncork());
        }

        request.corked = false;
    }

    return request;
}

//-------------)>

function sendStreamData(src, dest, done) {
    src
        .on("error", function(error) {
            dest.destroy(error);
        })
        .on("end", done)

        .pipe(dest, mpPipeOpts)

        .once("abort", function() {
            src.destroy();
        })
        .once("error", function() {
            src.destroy();
        });
}

//-------------)>

function makeFieldStr(name) {
    return mpCRLFBoundaryDiv +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n`;
}

function makeFieldStrValue(type, data) {
    switch(type) {
        case "boolean": return data === true ||  data === 1 || data === "1" || data === "yes" || data === "ok" ? "1" : "0";
        case "string": return typeof(data) === "string" || Buffer.isBuffer(data) ? data : (data + "");
        case "json": return typeof(data) === "string" || Buffer.isBuffer(data) ? data : (JSON.stringify(data) || "");

        default:
            throw new TypeError(`Unknown type: "${type}"`);
    }
}

function makeFieldFile(name, filename = "", type = "application/octet-stream") {
    return mpCRLFBoundaryDiv +
        `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
        `Content-Type: ${type}\r\n\r\n`;
}

//-------------)>

function updateMpBoundary() {
    const now = Date.now();
    const interval = 1000 * 60 * 5;

    if(now <= mpBoundaryTmUp) {
        return;
    }

    mpBoundaryTmUp = now + interval;

    mpBoundaryKey = Math.random().toString(16) + Math.random().toString(32).toUpperCase() + now.toString(32);
    mpBoundaryDiv = `--${mpBoundaryKey}\r\n`;
    mpBoundaryEnd  = `--${mpBoundaryKey}--\r\n`;

    mpCRLFBoundaryDiv = `\r\n${mpBoundaryDiv}`;
    mpCRLFBoundaryEnd = `\r\n${mpBoundaryEnd}`;

    mpHeaderContentType = `multipart/form-data; boundary="${mpBoundaryKey}"`;
}