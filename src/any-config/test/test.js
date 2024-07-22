const assert = require('node:assert');
const dedent = require("dedent");
const { ANY } = require("../exports");

const create_test_object = () => ({
    this_is: 'an arbitrarily complex object',
    array: [1,2,3,{x:1,y:2,z:[3,4,5]}],
    object: {x:3,y:4,z:[6,7,8,{j:'a',k:'b'}]},
});

// note: TOML excluded because it doesn't support stringify
const extensions = ['.json', '.json5', '.yaml', '.yml'];

describe('ANY', () => {
    for ( const ext of extensions ) {
        describe(`extension support: ${ext}`, () => {
            it('loads what it saves', () => {
                const a = create_test_object();
                const b = create_test_object();
                const s = ANY.stringify(ext, a);
                const o = ANY.parse(ext, s);
                assert.deepStrictEqual(o, b);
            })
        })
    }
    describe('explode_name', () => {
        it ('lists all extensions with parse and stringify', () => {
            const names = ANY.explode_name('config');
            for ( const ext of extensions ) {
                assert.ok(names.includes(`config${ext}`),
                    `is ${ext} in ${names}?`);
            }
        })
    })
})