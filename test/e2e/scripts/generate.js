'use strict';

const OpenAPI = require('../../../dist');

async function generate(version, client) {
    await OpenAPI.generate({
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/${version}/${client}/js/api/`,
        httpClient: client,
        useOptions: false,
        useUnionTypes: false,
    });
}

module.exports = generate;
