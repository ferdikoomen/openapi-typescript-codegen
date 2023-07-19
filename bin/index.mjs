#!/usr/bin/env node

'use strict';

import { program } from 'commander';

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const params = program
    .name('openapi')
    .usage('[options]')
    .version(pkg.version)
    .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .requiredOption('-f, --factories <value>', 'Path to file with factories functions (required)')
    .option('-o, --output <value>', 'Output directory (default ./generated/open-api)')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios, angular]', 'fetch')
    .option('--name <value>', 'Custom client class name')
    .option('--useUnionTypes', 'Use union types instead of enums', true)
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--indent <value>', 'Indentation options [4, 2, tabs]', '4')
    .option('--postfixServices <value>', 'Service name postfix', 'Service')
    .option('--postfixModels <value>', 'Model name postfix')
    .parse(process.argv)
    .opts();


const OpenAPI = await import('../dist/index.mjs');

if (OpenAPI) {
    OpenAPI.generate({
        input: params.input,
        output: params.output,
        httpClient: params.client,
        clientName: params.name,
        useUnionTypes: params.useUnionTypes,
        exportCore: JSON.parse(params.exportCore) === true,
        exportServices: JSON.parse(params.exportServices) === true,
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        indent: params.indent,
        postfixServices: params.postfixServices,
        postfixModels: params.postfixModels,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
