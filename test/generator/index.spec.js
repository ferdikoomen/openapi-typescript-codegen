'use strict';

const OpenAPI = require('../../dist');
const glob = require('glob');
const fs = require('fs');

describe('v2', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v2.json',
            output: './test/generator/dist/v2/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        const files = glob.sync('./test/generator/dist/v2/**/*.ts');

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.json',
            output: './test/generator/dist/v3/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        const files = glob.sync('./test/generator/dist/v3/**/*.ts');

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});
