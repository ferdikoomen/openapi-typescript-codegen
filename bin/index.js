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
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios, angular]', 'fetch')
    .option('--name <value>', 'Custom client class name')
    .option('--useOptions', 'Use options instead of arguments')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportClient <value>', 'Write main Client file to disk', true)
    .option('--exportIndex <value>', 'Write Index to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--indent <value>', 'Indentation options [4, 2, tabs]', '4')
    .option('--postfix <value>', 'Service name postfix', 'Service')
    .option('--request <value>', 'Path to custom request file')
    .option('--serviceTemplate <value>', 'Path to custom service handlebars template to generate the service files')
    .option('--clientTemplate <value>', 'Path to custom client handlebars template to generate the client file')
    .option('--indexTemplate <value>', 'Path to custom index handlebars template to generate the index file')
    .parse(process.argv)
    .opts();

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

if (OpenAPI) {
    OpenAPI.generate({
        input: params.input,
        output: params.output,
        httpClient: params.client,
        clientName: params.name,
        useOptions: params.useOptions,
        useUnionTypes: params.useUnionTypes,
        exportCore: JSON.parse(params.exportCore) === true,
        exportServices: JSON.parse(params.exportServices) === true,
        exportModels: JSON.parse(params.exportModels) === true,
        exportClient: JSON.parse(params.exportClient) === true,
        exportIndex: JSON.parse(params.exportIndex) === true,
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        indent: params.indent,
        postfix: params.postfix,
        request: params.request,
        serviceTemplate: params.serviceTemplate,
        clientTemplate: params.clientTemplate,
        indexTemplate: params.indexTemplate,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
