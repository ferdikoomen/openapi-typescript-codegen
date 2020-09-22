#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

program
    .version(pkg.version)
    .option('-i, --input <value>', 'Path to swagger specification', './spec.json')
    .option('-o, --output <value>', 'Output directory', './generated')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr]', 'fetch')
    .option('--useOptions', 'Use options vs arguments style functions')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--exportCore <value>', 'Generate core', true)
    .option('--exportServices <value>', 'Generate services', true)
    .option('--exportModels <value>', 'Generate models', true)
    .option('--exportSchemas <value>', 'Generate schemas', false)
    .parse(process.argv);

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

if (OpenAPI) {
    OpenAPI.generate({
        input: program.input,
        output: program.output,
        httpClient: program.client,
        useOptions: program.useOptions,
        useUnionTypes: program.useUnionTypes,
        exportCore: JSON.parse(program.exportCore) === true,
        exportServices: JSON.parse(program.exportServices) === true,
        exportModels: JSON.parse(program.exportModels) === true,
        exportSchemas: JSON.parse(program.exportSchemas) === true,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
