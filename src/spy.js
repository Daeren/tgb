//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const EE = require("events");

const {
    getDataByPath
} = require("./tools");

//-----------------------------------------------------

const updates = [];

//-----------------------------------------------------

module.exports = spy;

//-----------------------------------------------------

function spy(options) {
    let _bind;

    //---------------------]>

    class Spy extends EE {
        constructor(options) {
            super();

            //------]>

            options = options || {};
            _bind = this;

            //------]>

            const watch = (type, listener) => {
                const ctx = Object.create(this);
                const ls = function() { return listener.apply(ctx, arguments); };

                ctx.destroy = () => this.removeListener(type, ls);

                return this.on(type, ls);
            };

            Object.setPrototypeOf(watch, this);

            //------]>

            this._sortDesc = typeof(options.desc) === "undefined" ? false : !!options.desc;
            this.subTypes = {};

            //------]>

            if(this._sortDesc) {
                this._sortFunc = (a, b) => b.path.length - a.path.length;
            }
            else {
                this._sortFunc = (a, b) => a.path.length - b.path.length;
            }

            //------]>

            return watch;
        }


        _setSubType(type) {
            if(type && typeof(type) === "string") {
                const path = type.trim().split(".");

                if(path.length > 1) {
                    const t = path.shift();

                    if(!super.listenerCount(type)) {
                        this.subTypes[t] = this.subTypes[t] || [];
                        this.subTypes[t].push({type, path});
                        this.subTypes[t] = this.subTypes[t].sort(this._sortFunc);
                    }
                }
                else if(!super.listenerCount(type)) {
                    updates.push(type);
                }
            }
        }

        _removeSubType(type) {
            const path = type.trim().split(".");

            if(path.length > 1) {
                const t = path.shift();
                this.subTypes[t] = this.subTypes[t].filter((e) => e.type !== type);
            }
            else if(!super.listenerCount(type)) {
                updates = updates.filter((e) => e !== type);
            }
        }


        update(data, bot) {
            if(!data || typeof(data) !== "object") {
                return false;
            }

            //---------]>

            let update,
                eventType,
                eventSubType;

            //---------]>

            for(let i = 0, len = updates.length; !update && i < len; ++i) {
                update = data[eventType = updates[i]];

            }

            if(!update) {
                return false;
            }

            //---------]>

            _bind.emit(eventType, update, bot, data);

            //---------]>

            if(_bind.subTypes) {
                const t = _bind.subTypes[eventType];

                for(let d, i = 0, len = t && t.length || 0; i < len; ++i) {
                    const {type, path} = t[i];

                    d = getDataByPath(update, path);

                    if(typeof(d) !== "undefined") {
                        _bind.emit(type, d, bot, update);
                    }
                }
            }

            //---------]>

            return true;
        }

        on(type, listener) {
            this._setSubType(type);
            return super.on(type, listener);
        }

        removeListener(type, listener) {
            const result = super.removeListener(type, listener);

            if(!super.listenerCount(type)) {
                this._removeSubType(type);
            }

            return result;
        }

        removeAllListeners(type) {
            this._removeSubType(type);
            return super.removeAllListeners(type);
        }
    }

    //---------------------]>

    return new Spy(options);
}
