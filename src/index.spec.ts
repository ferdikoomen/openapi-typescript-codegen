import * as OpenAPI from '.';

describe('index', () => {
    it('parses v2 without issues', () => {
        OpenAPI.generate('./test/mock/v2/spec.json', './test/result/v2/', OpenAPI.HttpClient.FETCH, false, false);
    });

    it('parses v3 without issues', () => {
        OpenAPI.generate('./test/mock/v3/spec.json', './test/result/v3/', OpenAPI.HttpClient.FETCH, false, false);
    });
});
