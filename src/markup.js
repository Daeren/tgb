//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const baseMarkup = {
    keyboard,
    removeKeyboard,
    forceReply,

    "reply": forceReply
};

//-----------------------------------------------------

class Markup {
    constructor(message) {
        this.message = message;
    }
}

//-----------------------------------------------------

for(let [k, v] of Object.entries(baseMarkup)) {
    const func = baseMarkup[k];

    Markup.prototype[k] = function() {
        const {message} = this;
        const result = func.apply(func, arguments);

        if(message instanceof(Map)) {
            message.set("reply_markup", result);
        }
        else {
            message.reply_markup = result;
        }

        return message;
    };
}

//-----------------------------------------------------

module.exports = Object.assign(function(message) {
    if(!message || typeof(message) !== "object" || Array.isArray(message)) {
        throw new TypeError("`message` is not an object/map")
    }

    return new Markup(message);
}, baseMarkup);

//-----------------------------------------------------

function keyboard(kb, oneTime, resize = true, selective = false) {
    return !kb ? removeKeyboard(selective) : {
        "keyboard": parseTextKb(kb),
        "resize_keyboard": resize,
        "one_time_keyboard": oneTime,
        selective
    };
}

function removeKeyboard(selective) {
    return {
        "remove_keyboard": true,
        selective
    }
}

function forceReply(selective) {
    return {
        "force_reply": true,
        selective
    }
}

//-----------------------------------------------------

function parseTextKb(kb) {
    const rt = [];

    //-------]>

    kb
        .split(/\r?\n/g)
        .forEach(function(row, i) {
            const ct = [];

            row
                .split(/\|/g)
                .forEach(function(column, j) {
                    ct.push({"text": column})
                });

            rt.push(ct);
        });

    //-------]>

    return rt;
}