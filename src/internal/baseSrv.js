//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const {
    cbNoop
} = require("./../tools");

//-----------------------------------------------------

module.exports = function(v) {
    return Object.assign({
        start() {},
        stop() {},

        catch(callback) {
            this._watchDog = typeof(callback) === "function" ? callback : cbNoop;
            return this;
        }
    }, v);
};