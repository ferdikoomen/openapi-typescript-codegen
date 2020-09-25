'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v3.xhr', () => {

    beforeAll(async () => {
        await generate('v3', 'xhr');
        await copy('v3', 'xhr');
        await compile('v3', 'xhr');
        await server.start('v3', 'xhr');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
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
