const OpenAPI = require('../dist');

OpenAPI.generate(
    './test/mock/spec-v3.json',
    './test/result/v3/typescript/',
    OpenAPI.Language.TYPESCRIPT,
    OpenAPI.HttpClient.FETCH,
);

// OpenAPI.generate(
//     './test/mock/spec-v2.json',
//     './test/result/v2/typescript/',
//     OpenAPI.Language.TYPESCRIPT,
//     OpenAPI.HttpClient.FETCH,
// );

// OpenAPI.generate(
//     './test/mock/spec-v2.json',
//     './test/result/v2/javascript/',
//     OpenAPI.Language.JAVASCRIPT,
//     OpenAPI.HttpClient.XHR,
// );

// OpenAPI.compile('./test/result/v2/typescript/');
