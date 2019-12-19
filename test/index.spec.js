const OpenAPI = require('../dist');
const glob = require('glob');
const fs = require('fs');

describe('generation', () => {

    describe('v2', () => {

        OpenAPI.generate(
            './test/mock/v2/spec.json',
            './test/result/v2/',
            OpenAPI.HttpClient.FETCH,
        );

        test.each(glob
            .sync('./test/result/v2/**/*.ts')
            .map(file => [file])
        )('file(%s)', file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });

    describe('v3', () => {

        OpenAPI.generate(
            './test/mock/v3/spec.json',
            './test/result/v3/',
            OpenAPI.HttpClient.FETCH,
        );

        test.each(glob
            .sync('./test/result/v3/**/*.ts')
            .map(file => [file])
        )('file(%s)', file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});


