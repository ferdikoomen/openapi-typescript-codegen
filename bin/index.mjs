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
    .option('--useUnionTypes <value>', 'Use union types instead of enums', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--indent <value>', 'Indentation options [4, 2, tabs]', '4')
    .option('--postfixModels <value>', 'Model name postfix')
    .parse(process.argv)
    .opts();


const OpenAPI = await import('../dist/index.mjs');

console.log({
    useUnionTypes: JSON.parse(params.useUnionTypes) !== false,
});

if (OpenAPI) {
    OpenAPI.generate({
        input: params.input,
        output: params.output,
        factories: params.factories,
        useUnionTypes: JSON.parse(params.useUnionTypes) !== false,
        exportServices: JSON.parse(params.exportServices) === true,
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        indent: params.indent,
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
