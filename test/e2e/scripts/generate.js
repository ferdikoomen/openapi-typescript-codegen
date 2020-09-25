'use strict';

const OpenAPI = require('../../../dist');

async function generate(version, client) {
    await OpenAPI.generate({
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/src/${version}/${client}`,
        httpClient: client,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
    });
}

module.exports = generate;
