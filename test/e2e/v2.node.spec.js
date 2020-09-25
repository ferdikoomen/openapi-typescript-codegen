'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');

let tests;

describe('v2.node', () => {

    beforeAll(async () => {
        await generate('v2', 'node');
        await copy('v2', 'node');
        await compile('v2', 'fetch');
        await server.start('v2', 'fetch');
        tests = require('./generated/v2/node/js/index.js');
    }, 30000);

    afterAll(async () => {
        await server.stop();
        tests = null;
    });

    it('complexService', async () => {
        const result = await tests.complexService.complexTypes();
        expect(result).toBeTruthy();
    });

    it('defaultsService', async () => {
        const result1 = await tests.defaultsService.callWithDefaultParameters();
        const result2 = await tests.defaultsService.callWithDefaultOptionalParameters();
        const result3 = await tests.defaultsService.callToTestOrderOfParams();
        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
    });

    it('headerService', async () => {
        const result = await tests.headerService.callWithResultFromHeader();
        expect(result).toBeTruthy();
    });

    it('parametersService', async () => {
        const result1 = await tests.parametersService.callWithParameters();
        const result2 = await tests.parametersService.callWithWeirdParameterNames();
        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
    });

    it('responseService', async () => {
        const result1 = await tests.responseService.callWithResponse();
        const result2 = await tests.responseService.callWithResponses();
        const result3 = await tests.responseService.callWithDuplicateResponses();
        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
    });

    it('simpleService', async () => {
        const result1 = await tests.simpleService.getCallWithoutParametersAndResponse();
        const result2 = await tests.simpleService.putCallWithoutParametersAndResponse();
        const result3 = await tests.simpleService.postCallWithoutParametersAndResponse();
        const result4 = await tests.simpleService.deleteCallWithoutParametersAndResponse();
        const result5 = await tests.simpleService.optionsCallWithoutParametersAndResponse();
        const result6 = await tests.simpleService.headCallWithoutParametersAndResponse();
        const result7 = await tests.simpleService.patchCallWithoutParametersAndResponse();
        expect(result1).toBeTruthy();
        expect(result2).toBeTruthy();
        expect(result3).toBeTruthy();
        expect(result4).toBeTruthy();
        expect(result5).toBeTruthy();
        expect(result6).toBeTruthy();
        expect(result7).toBeTruthy();
    });

    it('typesService', async () => {
        const result = await tests.typesService.types();
        expect(result).toBeTruthy();
    });

});
