'use strict';

const generate = require('./scripts/generate');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const server = require('./scripts/server');

describe('v2.node', () => {

    beforeAll(async () => {
        await generate('v2/node', 'v2', 'node');
        compileWithTypescript('v2/node');
        await server.start('v2/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v2/node/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN')
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('complexService', async () => {
        const { ComplexService } = require('./generated/v2/node/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!'
                }
            }
        });
        expect(result).toBeDefined();
    });

    it('passes timeout', async () => {
        const { DelayService, OpenAPI } = require('./generated/v2/node/index.js');
        OpenAPI.TIMEOUT = 1000;
        const result = await DelayService.callWithRequestHeader('500');
        expect(result).toBeDefined();
    });

    it('throws on timeout', async () => {
        const { DelayService, OpenAPI, TimeoutError } = require('./generated/v2/node/index.js');
        OpenAPI.TIMEOUT = 1000;
        return expect(() => DelayService.callWithRequestHeader('1500')).rejects.toThrow(TimeoutError);
    });
});
