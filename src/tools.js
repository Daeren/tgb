//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const fs = require("fs");
const path = require("path");
const url = require("url");

const http = require("http");
const https = require("https");

//-----------------------------------------------------

const reIsFilePath = /[\\\/\.]/;
const reIsHttps = /^https:/;

const pumpPipeOpts = {"end": false};

//-----------------------------------------------------

class DLL {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    push(v) {
        const entry = {"data": v, "next": null, "prev": this.tail};

        if(this.length > 0) {
            this.tail.next = entry;
        }
        else {
            this.head = entry;
        }

        this.tail = entry;
        ++this.length;
    }

    unshift(v) {
        const entry = {"data": v, "next": this.head, "prev": null};

        if(this.length === 0) {
            this.tail = entry;
        }
        else {
            this.head.prev = entry;
        }

        this.head = entry;
        ++this.length;
    }


    shift() {
        if(this.length === 0) {
            return;
        }

        const ret = this.head.data;

        if(this.length === 1) {
            this.head = this.tail = null;
        }
        else {
            this.head = this.head.next;
            this.head.prev = null;
        }

        --this.length;
        return ret;
    }

    pop() {
        if(this.length === 0) {
            return;
        }

        const ret = this.tail.data;

        if(this.length === 1) {
            this.head = this.tail = null;
        }
        else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        --this.length;
        return ret;
    }


    remove(node) {
        if(this.length === 0) {
            return null;
        }

        let ret = null;

        if(this.length === 1) {
            this.head = this.tail = null;
        }
        else {
            const tQP = node.prev;
            const tQN = node.next;

            if(tQP) {
                tQP.next = tQN;
                node.prev = null;
            }
            else {
                this.head = tQN;
            }

            if(tQN) {
                tQN.prev = tQP;
                node.next = null;
            }
            else {
                this.tail = tQP;
            }

            ret = tQN;
        }

        --this.length;
        return ret;
    }

    clear() {
        this.head = this.tail = null;
        this.length = 0;
    }

    first() {
        return this.head.data;
    }
}

//-----------------------------------------------------

module.exports = {
    DLL,

    cbNoop,
    once,
    forEachAsync,

    isStream,
    isFsStream,
    isRequestStream,
    isResponseStream,
    isHttp,
    isHttps,
    isFilepath,

    pump,
    getDataByPath,

    getFilenameFromStream,
    getFileExtByMime,
    getRequest,
    getWebContent
};

//-----------------------------------------------------

function cbNoop(error) {
    if(error) {
        throw error;
    }
}

function once(func) {
    let fired = false;

    return function() {
        if(!fired) {
            fired = true;
            func.apply(this, arguments);
        }
    };
}

function forEachAsync(data, iter, cbEnd) {
    cbEnd = cbEnd || cbNoop();

    //---------]>

    const len = data && data.length;

    let i = 0;

    //---------]>

    if(len) {
        run();
    }
    else {
        cbEnd(null);
    }

    //---------]>

    function run() {
        iter(next, data[i], i);
    }

    function next(error, result, stopped) {
        if(error || stopped) {
            cbEnd(error, result, i);
            return;
        }

        ++i;

        if(i >= len) {
            cbEnd(null, result, i);
        } else {
            run();
        }
    }
}

//-----------------------------------------------------

function isStream(stream) {
    return isFsStream(stream) || isRequestStream(stream) || isResponseStream(stream);
}

function isFsStream(stream) {
    return (stream instanceof(fs.ReadStream) || stream instanceof(fs.WriteStream)) && typeof(stream.close) === "function";
}

function isRequestStream(stream) {
    return !!(stream && stream.setHeader && typeof(stream.abort) === "function");
}

function isResponseStream(stream) {
    return !!(stream && stream.headers && stream.statusCode);
}

function isHttp(s) {
    return s && typeof(s) === "string" ? !reIsHttps.test(s) : false;
}

function isHttps(s) {
    return s && typeof(s) === "string" ? reIsHttps.test(s) : false;
}

function isFilepath(s) {
    return s && typeof(s) === "string" ? reIsFilePath.test(s) : false;
}

//-----------------------------------------------------

function pump(src, dest, done) {
    done = once(done || cbNoop);

    src
        .once("error", function(error) {
            dest.destroy(error);
        })
        .once("close", function() {
            src.destroy();
            done(null, false, true);
        })
        .once("end", function() {
            done(null, true, false);
        })

        .pipe(dest, pumpPipeOpts)

        .once("abort", function() {
            src.destroy();
            done(null, false, false);
        })
        .once("error", function(error) {
            src.destroy();
            done(error, false, false);
        });

    return dest;
}

function getDataByPath(data, path) {
    if(!data || !path || !Array.isArray(path)) {
        return void(0);
    }

    for(let p, i = 0, len = path.length; i < len; i++) {
        if(typeof(data) === "undefined") {
            return data;
        }

        p = path[i];

        if(Array.isArray(data)) {
            const pos = data.indexOf(p);
            data = pos === -1 ? void(0) : data[pos];
        }
        else {
            data = data[p];
        }
    }

    return data;
}

//-----------------------------------------------------

function getFilenameFromStream(rs) {
    if(!isStream(rs)) {
        return "";
    }

    const p = path.parse(rs.path || rs.req && rs.req.path || "");
    const name = p.name || "file";
    const ext = p.ext || (rs.headers && getFileExtByMime(rs.headers["content-type"])) || ".tmp";

    return `${name}${ext}`;
}

function getFileExtByMime(contentType) {
    switch(contentType) {
        case "text/plain": return ".txt";
        case "text/html": return ".html";
        case "text/javascript": return ".js";

        case "application/json": return ".json";
        case "application/pdf": return ".pdf";
        case "application/gzip": return ".gz";
        case "application/x-rar-compressed": return ".rar";

        case "image/bmp": return ".bmp";
        case "image/gif": return ".gif";
        case "image/webp": return ".webp";
        case "image/jpeg": return ".jpg";
        case "image/png": return ".png";
        case "image/apng": return ".apng";

        case "video/mp4": return ".mp4";
        case "video/mpeg": return ".mpeg";

        case "audio/ogg": return ".ogg";
        case "audio/mp4": return ".m4a";
        case "audio/wav": return ".wav";
        case "audio/webm": return ".weba";

        case "audio/MPA":
        case "audio/mpa-robust":
        case "audio/mpeg":
        case "audio/mp3":
            return ".mp3";

        default:
            return "." + (contentType || "").split("/").pop();
    }
}

function getRequest(href, callback) {
    const u = url.parse(href);
    const options   = {
        "host": u.hostname,
        "port": u.port,
        "path": u.path,

        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            "Referer": href
        }
    };

    return (isHttp(href) ? http : https)
        .get(options)
        .setTimeout(1000 * 60 * 2, function() {
            this.destroy(new Error("Timeout"));
        })
        .on("response", callback);
}

function getWebContent(href, callback, _attempts = 0) {
    callback = once(callback || cbNoop);

    //----------]>

    const req = getRequest(href, function(response) {
        const {statusCode, headers} = response;

        let error = null;

        //-----]>

        if(statusCode < 200 || statusCode > 399) {
            error = new Error(`getWebContent | statusCode: ${statusCode}`);
        }
        else if(_attempts >= 5) {
            error = new Error(`getWebContent | too long | attempts: ${_attempts}`);
            error.code = "EWCLONGREDIRECT";
        }
        else {
            const location = headers["location"];

            if(location) {
                req.abort();
                getWebContent(location, callback, _attempts + 1);

                return;
            }
        }

        if(error) {
            error.code = error.code || "EBADREQUEST";
            req.abort();
        }

        //-----]>

        callback(error, response);
    }).on("error", function(error) {
        req.abort();
        callback(error, null);
    });
}
