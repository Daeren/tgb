//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const _watchDog = (e) => {
    throw e;
};

//-----------------------------------------------------

module.exports = function(v) {
    return Object.assign({
        _watchDog,

        start() {},
        stop() {},

        catch(callback) {
            if(typeof(callback) !== "function") {
                throw new Error("Not a function");
            }

            this._watchDog = callback;

            return this;
        }
    }, v);
};