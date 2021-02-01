'use strict';

const OpenAPI = require('../dist');
const glob = require('glob');
const fs = require('fs');

describe('v2', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v2.json',
            output: './test/generated/v2/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        glob.sync('./test/generated/v2/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3', () => {
    it('should generate', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.json',
            output: './test/generated/v3/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
        });

        glob.sync('./test/generated/v3/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });
    });
});

describe('v3 datetype', () => {
    it('should generate files and apply the Date type to interfaces with the string format "date-time"', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3_datetype.yaml',
            output: './test/generated/v3_datetype/',
            httpClient: OpenAPI.HttpClient.FETCH,
            useOptions: true,
            useUnionTypes: true,
            exportCore: true,
            exportSchemas: true,
            exportModels: true,
            exportServices: true,
            useDateType: true,
        });

        glob.sync('./test/generated/v3_datetype/**/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            expect(content).toMatchSnapshot(file);
        });

        glob.sync('./test/generated/v3_datetype/models/*.ts').forEach(file => {
            const content = fs.readFileSync(file, 'utf8').toString();
            const getNameAndContentPattern = /export (?:interface|type) (\w+)([\s\S]+)*?\}/;
            const regexGroup = getNameAndContentPattern.exec(content);
            const interfaceName = regexGroup[1] || '';
            const interfaceContent = regexGroup[2] || '';
            const attribute = interfaceContent
                .split('\n')
                .map(att => att.trim())
                .find(att => att.startsWith('dateTime'));
            if (attribute) {
                console.log(`The interface ${interfaceName} with an attribute named 'dateTime' should have the data type of 'Date'`)
                expect(attribute).toMatch(/Date/);
            }
        });
    });
});
