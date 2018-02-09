//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");

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
        let response = await client(token, method, data, proxy);
        response = JSON.stringify(response || "", null, prettyJson ? "  " : null);

        process.stdout.write(response);
    }
    catch(e) {
        process.stderr.write(e.message);
        process.stderr.write(e.stack);
    }
}();
