'use strict';

const rollup = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');

async function build(version, client) {
    const input = `./test/e2e/generated/${version}/${client}/index.ts`;
    const output = `./test/e2e/generated/${version}/${client}/index.js`;
    const options = {
        treeshake: false,
        plugins: [
            typescript(),
            nodeResolve(),
            commonjs(),
        ],
        input: input,
        output: {
            file: output,
            format: 'cjs',
        },
    }
    const bundle = await rollup.rollup(options);
    await bundle.generate(options.output);
    await bundle.write(options.output);
}

module.exports = build;
