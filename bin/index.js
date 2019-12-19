#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

program
    .version(pkg.version)
    .option('--input [value]', 'Path to swagger specification', './spec.json')
    .option('--output [value]', 'Output directory', './generated')
    .option('--http-client [value]', 'HTTP client to generate [fetch, xhr]', 'fetch')
    .parse(process.argv);

const SwaggerCodegen = require(path.resolve(__dirname, '../dist/index.js'));

if (SwaggerCodegen) {
    SwaggerCodegen.generate(
        program.input,
        program.output,
        program.httpClient
    );
}
