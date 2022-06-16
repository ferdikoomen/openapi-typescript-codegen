#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const pkg = require('../package.json');

const params = program
    .name('saddlebackOpenApi')
    .usage('[options]')
    .version(pkg.version)
    .option('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .option('-o, --output <value>', 'Output directory (required)')
    .option('-c, --config <value>', 'Path to the config file')
    .parse(process.argv)
    .opts();

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));
const config = require(path.resolve(params.config || `./openapi.config.json`));

if (OpenAPI) {
    OpenAPI.generateCustomSpec({
        input: params.input,
        output: params.output,
        ...config,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
