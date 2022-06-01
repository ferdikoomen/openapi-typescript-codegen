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
    .option('--serverOutput <value>', 'Server output directory')
    .option('--serverDirName <value>', 'Server directory name')
    .option('--serverModelImportPath <value>', 'Server model import path')
    .option('--serverApiTypesImportPath <value>', 'Server Api Types import path')
    .option('--serverReqTypeName <value>', 'Name of Server Request type to use')
    .option('--serverResTypeName <value>', 'Name of Server Response type to use')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios, angular]', 'fetch')
    .option('--name <value>', 'Custom client class name')
    .option('--useOptions', 'Use options instead of arguments')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--indent <value>', 'Indentation options [4, 2, tabs]', '4')
    .option('--postfix <value>', 'Service name postfix', 'Service')
    .option('--request <value>', 'Path to custom request file')
    .parse(process.argv)
    .opts();

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

if (OpenAPI) {
    OpenAPI.generate({
        input: params.input,
        output: params.output,
        serverOutput: params.serverOutput,
        serverDirName: params.serverDirName,
        serverModelImportPath: params.serverModelImportPath,
        serverApiTypesImportPath: params.serverApiTypesImportPath,
        serverReqTypeName: params.serverReqTypeName,
        serverResTypeName: params.serverResTypeName,
        httpClient: params.client,
        clientName: params.name,
        useOptions: params.useOptions,
        useUnionTypes: params.useUnionTypes,
        exportCore: JSON.parse(params.exportCore) === true,
        exportServices: JSON.parse(params.exportServices) === true,
        exportModels: JSON.parse(params.exportModels) === true,
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        indent: params.indent,
        postfix: params.postfix,
        request: params.request,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
