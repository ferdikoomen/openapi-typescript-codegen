'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v2.xhr', () => {

    beforeAll(async () => {
        await generate('v2/xhr', 'v2', 'xhr');
        await copy('v2/xhr');
        compile('v2/xhr');
        await server.start('v2/xhr');
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
