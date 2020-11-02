'use strict';

const generate = require('./scripts/generate');
const compileWithTypescript = require('./scripts/compileWithTypescript');
const server = require('./scripts/server');

describe('v3.custom', () => {

    beforeAll(async () => {
        await generate('v3/custom', 'v3', 'custom');
        compileWithTypescript('v3/custom');

        const { OpenAPI } = require('./generated/v3/custom/index.js');
        const {CustomHttpClient} = require('./generated/v3/custom/core/request')

        CustomHttpClient.executeRequest = async (options) => {
            const url = `${OpenAPI.BASE}${options.path}`;
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN() :  OpenAPI.TOKEN;

            const headers = options.headers || {};
            if (token != null && token !== '') {
                headers.authorization ='Bearer '+token;
            }
            console.log("OPTIONS", options, OpenAPI, headers)
            return {
                ok: true,
                status: 200,
                body: {
                    method: options.method,
                    protocol: 'http',
                    hostname: 'localhost',
                    path: options.path,
                    url: url,
                    query: options.query,
                    body: options.body,
                    headers: headers,
                },
                statusText: 'OK',
                url: url
            }
        }
    }, 30000);

    it('requests token', async () => {

        const { OpenAPI, SimpleService } = require('./generated/v3/custom/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN')
        OpenAPI.TOKEN = tokenRequest;

        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('complexService', async () => {
        const { ComplexService } = require('./generated/v3/custom/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!'
                }
            }
        });
        expect(result).toBeDefined();
    });

});


