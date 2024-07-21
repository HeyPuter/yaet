/**
 * Base is a base for all classes.
 * - Create using a factory function, eliminating the
 *   "new" keyword and thereby allowing existing design
 *   pattern implementations to work for factoreies
 *   without modification.
 * - Do away with the redundancy of defining constructor
 *   arguments in an untyped language, which is pointless
 *   anyway. Instead, we have an "options" object.
 * - It may seem crazy, but so do a lot of design decisions
 *   in this project, so at least it's appropriate.
 */
class Base {
    constructor (options) {
        this.options = options;
        this._construct?.();
    }
    static create (options) {
        const o = new this(options);
        return o;
    }
}

module.exports = { Base };
