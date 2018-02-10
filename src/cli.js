//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");
const polling = require("./polling");
const download = require("./download");

//-----------------------------------------------------

const envToken = process.env.TELEGRAM_BOT_TOKEN;

const cmdData = {};
const cmdOptions = {};

//-----------------------------------------------------

(function() {
    let key, name;

    //------------]>

    process.argv.forEach(function(arg, i) {
        if(i < 2) {
            return;
        }

        //---------]>

        if(arg[0] === "-") {
            if(key) {
                setOpt(key, true);
            }

            key = null;
            name = arg.replace(/^-+/, "");

            if(arg[1] === "-") {
                key = name;
            }
            else {
                setOpt(name, true);
            }
        }
        else if(key) {
            setOpt(key, arg);
            key = null;
        }
    });

    if(key) {
        setOpt(key, true);
    }

    //------------]>

    function setOpt(k, v) {
        const t = k.split(/^d\./);

        if(t.length === 2) {
            cmdData[t.pop()] = v;
        }
        else {
            cmdOptions[k] = v;
        }
    }
})();

//-----------------------------------------------------

if(cmdOptions.data) {
    cmdOptions.data = JSON.parse(cmdOptions.data);
}

//-----------------------------------------------------

const token = cmdOptions.token || envToken;
const data = Array.isArray(cmdOptions.data) ? cmdOptions.data : Object.assign(cmdOptions.data || {}, cmdData);

const {
    method, proxy
} = cmdOptions;

const prettyJson = !!cmdOptions.j;

//-----------------------------------------------------

void async function() {
    try {
        if(cmdOptions.polling) {
            const t = cmdOptions.polling === true ? token : cmdOptions.polling;
            const {echo} = cmdOptions;

            polling(t, async function(data) {
                printJson(data);

                if(echo) {
                    printJson(await client(t, "sendMessage", {
                        "chat_id": data.message.from.id,
                        "text": formatJson(data)
                    }));
                }
            }).catch(function(error) {
                this.stop();

                delete error.response;
                printError(error);
            });
        }
        else if(cmdOptions.download) {
            const t = cmdOptions.download === true ? token : cmdOptions.download;

            const {
                id, dir, name
            } = cmdOptions;

            printJson(await download(t, id, dir, name));
        }
        else {
            printJson(await client(token, method, data, proxy));
        }
    }
    catch(e) {
        printError(e);
    }
}();

//-----------------------------------------------------

function printJson(data) {
    process.stdout.write(formatJson(data) + "\r\n");
}

function printError(error) {
    process.stderr.write(error.message);
    process.stderr.write("\r\n");
    process.stderr.write(error.stack);
    process.stderr.write("\r\n");
}

function formatJson(data) {
    return JSON.stringify(data || "", null, prettyJson ? "  " : null);
}