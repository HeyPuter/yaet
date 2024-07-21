import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { fileURLToPath } from 'url';
import path_ from 'node:path';

// necessary to copy CSS file for xterm; if anybody knows a
// better way to do this I would love to hear it.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'umd'
    },
    plugins: [
        nodeResolve({
            // rootDir: path_.join(process.cwd(), '..'),
            // rootDir: path_.join(process.cwd(), '../..'),
        }),
        commonjs(),
        copy({
            targets: [
                {
                    src: require.resolve('@xterm/xterm/css/xterm.css'),
                    dest: 'dist'
                },
                {
                    src: 'assets/*',
                    dest: 'dist'
                }
            ],
        })
    ]
}