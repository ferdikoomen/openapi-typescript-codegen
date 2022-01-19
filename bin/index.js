#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const pkg = require('../package.json');

const params = program
    .name('openapi')
    .usage('[options]')
    .version(pkg.version)
    .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .requiredOption('-o, --output <value>', 'Output directory (required)')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios]', 'fetch')
    .option('--useOptions', 'Use options instead of arguments')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--postfix <value>', 'Service name postfix', 'Service')
    .option('--request <value>', 'Path to custom request file')
    .option('-so, --serviceOptions <value>, Service options path')
    .parse(process.argv)
    .opts();

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

const genereteParams = {
    input: params.input,
    output: params.output,
    httpClient: params.client,
    useOptions: params.useOptions,
    useUnionTypes: params.useUnionTypes,
    exportCore: JSON.parse(params.exportCore) === true,
    exportServices: JSON.parse(params.exportServices) === true,
    exportModels: JSON.parse(params.exportModels) === true,
    exportSchemas: JSON.parse(params.exportSchemas) === true,
    postfix: params.postfix,
    request: params.request,
};

if (params.serviceOptions) {
    genereteParams.serviceOptions = require(path.resolve(process.cwd(), params.serviceOptions));
}

if (OpenAPI) {
    OpenAPI.generate(genereteParams)
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
