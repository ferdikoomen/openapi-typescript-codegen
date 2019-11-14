#!/usr/bin/env node

'use strict';

const OpenAPI = require('../dist');

OpenAPI.generate(
    './test/mock/v2/spec.json',
    './test/tmp/v2/spec',
    OpenAPI.Language.TYPESCRIPT,
    OpenAPI.HttpClient.FETCH,
);

// OpenAPI.generate(
//     './test/mock/v2/test-addon.json',
//     './test/tmp/v2/ts/test-addon',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
// OpenAPI.generate(
//     './test/mock/v2/test-docs.json',
//     './test/tmp/v2/ts/test-docs',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
// OpenAPI.generate(
//     './test/mock/v2/test-sites.json',
//     './test/tmp/v2/ts/test-sites',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );

// OpenAPI.generate(
//     './test/mock/v2/test-petstore.yaml',
//     './test/tmp/v2/test-petstore-yaml',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
// OpenAPI.generate(
//     './test/mock/v3/test-petstore.json',
//     './test/tmp/v3/test-petstore-json',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH
// );
//
// OpenAPI.generate(
//     './test/mock/v3/test-petstore.yaml',
//     './test/tmp/v3/test-petstore-yaml',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
// OpenAPI.generate(
//     './test/mock/v3/test-uspto.json',
//     './test/tmp/v3/test-uspto',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
// OpenAPI.generate(
//     './test/mock/v3/test-with-examples.json',
//     './test/tmp/v3/test-with-examples',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );
//
