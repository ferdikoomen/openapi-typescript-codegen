#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

program
    .version(pkg.version)
    .option('--input [value]', 'Path to swagger specification', './spec.json')
    .option('--output [value]', 'Output directory', './generated')
    .option('--client [value]', 'HTTP client to generate [fetch, xhr]', 'fetch')
    .option('--useOptions', 'Use options vs arguments style functions', false)
    .option('--useUnionTypes', 'Use inclusive union types', false)
    .option('--exportCore', 'Generate core', true)
    .option('--exportServices', 'Generate services', true)
    .option('--exportModels', 'Generate models', true)
    .option('--exportSchemas', 'Generate schemas', false)
    .parse(process.argv);

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

if (OpenAPI) {
    OpenAPI.generate({
        input: program.input,
        output: program.output,
        httpClient: program.client,
        useOptions: program.useOptions,
        useUnionTypes: program.useUnionTypes,
        exportCore: program.exportCore,
        exportServices: program.exportServices,
        exportModels: program.exportModels,
        exportSchemas: program.exportSchemas,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
