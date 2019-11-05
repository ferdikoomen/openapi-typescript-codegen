#!/usr/bin/env node

'use strict';

const OpenAPI = require('../dist');

OpenAPI.generate(
    './test/mock/v2/test-petstore.json',
    './test/tmp/v2/ts/test-petstore',
    OpenAPI.Language.TYPESCRIPT,
    OpenAPI.HttpClient.FETCH,
);

OpenAPI.generate(
    './test/mock/v2/test-petstore.json',
    './test/tmp/v2/js/test-petstore',
    OpenAPI.Language.JAVASCRIPT,
    OpenAPI.HttpClient.FETCH,
);

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
