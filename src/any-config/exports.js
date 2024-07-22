const JSON5 = require('json5');
const YAML = require('yaml');
const toml = require('toml');

const parsers = {};

parsers['.json'] = {
    empty: () => '{}',
    parse: text => JSON5.parse(text), // 'JSON5' is intentional
    stringify: value => JSON.stringify(value, undefined, '    '),
};
parsers['.json5'] = {
    empty: () => '{}',
    parse: text => JSON5.parse(text),
    stringify: value => JSON5.stringify(value, undefined, '    '),
};
parsers['.yaml'] = {
    empty: () => '',
    parse: YAML.parse.bind(YAML),
    stringify: YAML.stringify.bind(YAML),
};
parsers['.yml'] = parsers['.yaml'];
parsers['.toml'] = {
    empty: () => '',
    parse: toml.parse.bind(toml),
};

const ANY = {
    parse (ext, text) {
        return parsers[ext].parse(text);
    },
    stringify (ext, value) {
        return parsers[ext].stringify(value);
    },
    empty (ext) {
        return parsers[ext].empty();
    },
    capabilities (ext) {
        const capabilities = [];
        if ( ! parsers[ext] ) return capabilities;
        const methods = ['empty', 'parse', 'stringify'];
        for ( const method_name of methods ) {
            if ( parsers[ext][method_name] ) {
                capabilities.push(method_name);
            }
        }
        return capabilities;
    },
    explode_name (name, requirements = []) {
        const exts = [];
        for ( const ext in parsers ) {
            const capabilities = this.capabilities(ext);
            if ( requirements.every(name => capabilities.includes(name)) ) {
                exts.push(ext);
            }
        }
        for ( let i=0 ; i < exts.length ; i++ ) {
            exts[i] = name + exts[i];
        }
        return exts;
    }
};

module.exports = { ANY };
