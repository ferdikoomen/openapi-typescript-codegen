const OpenAPI = require('../dist');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

describe('generation', () => {

    describe('typescript', () => {

        OpenAPI.generate(
            './test/mock/spec-v2.json',
            './test/result/v2/typescript/',
            OpenAPI.Language.TYPESCRIPT,
            OpenAPI.HttpClient.FETCH,
        );

        test.each(glob
            .sync('./test/result/v2/typescript/**/*.ts')
            .map(file => [file])
        )('file(%s)', file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    describe('javascript', () => {

        OpenAPI.generate(
            './test/mock/spec-v2.json',
            './test/result/v2/javascript/',
            OpenAPI.Language.JAVASCRIPT,
            OpenAPI.HttpClient.XHR,
        );

        test.each(glob
            .sync('./test/result/v2/javascript/**/*.js')
            .map(file => [file])
        )('file(%s)', file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

});


