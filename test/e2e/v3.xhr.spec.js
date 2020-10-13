'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v3.xhr', () => {

    beforeAll(async () => {
        await generate('v3/xhr', 'v3', 'xhr');
        await copy('v3/xhr');
        compile('v3/xhr');
        await server.start('v3/xhr');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('requests token', async () => {
        const result = await browser.evaluate(async () => {
            window.api.OpenAPI.TOKEN = new Promise(resolve => {
                setTimeout(() => {
                    resolve('MY_TOKEN');
                }, 500);
            });
            return await window.api.SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            return await window.api.ComplexService.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!'
                    }
                }
            });
        });
        expect(result).toBeDefined();
    });
});
