const { Base } = require("../lang-util/Base");

class WinManager extends Base {
    _construct () {
        this.windows_ = {};
    }
    register (id, window) {
        this.windows_[id] = window;
    }
    get (id) {
        return this.windows_[id];
    }
}

module.exports = {
    WinManager,
};
