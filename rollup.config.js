'use strict';

const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

/**
 * Custom plugin to parse handlebar imports and precompile
 * the template on the fly. This reduces runtime by about
 * half on large projects.
 */
function handlebarsPlugin() {
    return {
        resolveId(file, importer) {
            if (file.endsWith('.hbs')) {
                return path.resolve(path.dirname(importer), file);
            }
            return null;
        },
        load(file) {
            if (file.endsWith('.hbs')) {
                const template = fs.readFileSync(file, 'utf8').toString().trim();
                const templateSpec = handlebars.precompile(template, {
                    strict: true,
                    noEscape: true,
                    preventIndent: true,
                    knownHelpersOnly: true,
                    knownHelpers: {
                        equals: true,
                        notEquals: true,
                    },
                });
                return `export default ${templateSpec};`;
            }
            return null;
        },
    };
}

export default {
    input: './src/index.ts',
    output: {
        file: './dist/index.js',
        format: 'cjs',
    },
    external: [
        'fs',
        'os',
        'util',
        'http',
        'https',
        'handlebars/runtime',
        ...external,
    ],
    plugins: [
        handlebarsPlugin(),
        typescript({
            clean: true,
        }),
        nodeResolve(),
        commonjs(),
        terser({
            output: {
                comments: false,
            },
        }),
    ],
};
