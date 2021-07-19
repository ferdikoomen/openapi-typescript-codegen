'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compileWithBabel = require('./scripts/compileWithBabel');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

fdescribe('v3.babel.fetch', () => {

    beforeAll(async () => {
        await generate('v3/babel', 'v3', 'fetch', true, true);
        await copy('v3/babel');
        compileWithBabel('v3/babel');
        await server.start('v3/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = window.tokenRequest;
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = window.api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = window.api;
            return await ComplexService.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!'
                    }
                }
            });
        });
        expect(result).toBeDefined();
    });

    it('passes timeout', async () => {
        const result = await browser.evaluate(async () => {
            const { DelayService, OpenAPI } = window.api;
            OpenAPI.TIMEOUT = 1000;
            return await DelayService.callWithRequestHeader({ xDelay: '500' });
        });
        expect(result).toBeDefined();
    });

    it('throws on timeout', async () => {
        const result = await browser.evaluate(async () => {
            const { DelayService, OpenAPI, TimeoutError } = window.api;
            OpenAPI.TIMEOUT = 1000;
            try {
                await DelayService.callWithRequestHeader({ xDelay: '1500' });
                return { passed: false, message: 'did not trigger timeout' };
            } catch (error) {
                if (error instanceof TimeoutError) {
                    return { passed: true };
                }
                return { passed: false, message: `threw another error: ${error.constructor.name} - ${error.message}` };
            }
        });
        expect(result.message).not.toBeDefined();
        expect(result.passed).toBeTruthy();
    });
});
