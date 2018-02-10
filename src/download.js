//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const fs = require("fs");
const path = require("path");

const client = require("./client");

const {
    getWebContent,
    pump
} = require("./tools");

//-----------------------------------------------------

module.exports = download;

//-----------------------------------------------------

function download(token, fileId, dir = "./", filename = "") {
    return new Promise(function(resolve, reject) {
        client(token, "getFile", {"file_id": fileId})
            .then(function(data) {
                const fileId = data.file_id;
                const fileSize = data.file_size;
                const filePath = data.file_path;

                const p = path.parse(filePath);

                const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
                const filepath = path.normalize(path.join(dir, filename || p.base));

                //----------]>

                getWebContent(url, function(error, response) {
                    if(error) {
                        error.response = response;
                        reject(error);
                    }
                    else {
                        const ws = fs.createWriteStream(filepath);

                        pump(response, ws, function(error, finished, closed) {
                            if(error) {
                                reject(error);
                            }
                            else if(!finished) {
                                reject(new Error("The stream was closed before all expected data was received"));
                            }
                            else {
                                ws.end(function() {
                                    resolve({
                                        "id":   fileId,
                                        "size": fileSize,
                                        "file": filepath
                                    });
                                });
                            }
                        });

                    }
                });
            })
            .catch(reject);
    });
}