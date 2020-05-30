'use strict';

const OpenAPI = require('../dist');
const glob = require('glob');
const fs = require('fs');

describe('v2', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/mock/v2/spec.json',
            output: './test/result/v2/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: true,
            useUnionTypes: true,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/mock/v3/spec.json',
            output: './test/result/v3/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: true,
            useUnionTypes: true,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });
    });
});

describe('v2 (snapshot)', () => {
    const files = glob.sync('./test/result/v2/**/*.ts');
    test.each(files.map(file => [file]))('file(%s)', file => {
        const content = fs.readFileSync(file, 'utf8').toString();
        expect(content).toMatchSnapshot(file);
    });
});

describe('v3 (snapshot)', () => {
    const files = glob.sync('./test/result/v3/**/*.ts');
    test.each(files.map(file => [file]))('file(%s)', file => {
        const content = fs.readFileSync(file, 'utf8').toString();
        expect(content).toMatchSnapshot(file);
    });
});
