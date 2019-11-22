#!/usr/bin/env node

'use strict';

const OpenAPI = require('../dist');

OpenAPI.generate(
    './test/mock/spec-v2.json',
    './test/tmp/v2/ts/',
    OpenAPI.Language.TYPESCRIPT,
    OpenAPI.HttpClient.FETCH,
);

OpenAPI.generate(
    './test/mock/spec-v2.json',
    './test/tmp/v2/js/',
    OpenAPI.Language.JAVASCRIPT,
    OpenAPI.HttpClient.XHR,
);

OpenAPI.compile('./test/tmp/v2/ts/');

