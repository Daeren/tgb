//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

module.exports = entities;

//-----------------------------------------------------

function entities(message) {
    const entities = message && message.entities;

    //---------]>

    if(!entities || !Array.isArray(entities) || !entities.length) {
        return null;
    }

    //---------]>

    const {text} = message;
    const result = {};

    //---------]>

    Object.defineProperty(result, "toString", {
        "enumerable": false,
        value() { return JSON.stringify(result); }
    });

    entities.forEach(function({type, offset, length}) {
        const cmd = text.substring(offset, offset + length);

        result[type] = result[type] || [];
        result[type].push(cmd);
    });

    //---------]>

    return result;
}