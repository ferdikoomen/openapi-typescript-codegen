const OpenAPI = require('../dist');

OpenAPI.generate(
    './test/mock/v2/spec.json',
    './test/result/v2/',
    OpenAPI.HttpClient.FETCH,
);

OpenAPI.generate(
    './test/mock/v3/spec.json',
    './test/result/v3/',
    OpenAPI.HttpClient.FETCH,
);

OpenAPI.compile('./test/result/v2/');
OpenAPI.compile('./test/result/v3/');
