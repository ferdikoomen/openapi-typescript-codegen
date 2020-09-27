'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const transpile = require('./scripts/transpile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v2.fetch', () => {

    beforeAll(async () => {
        await generate('v2/babel', 'v2', 'fetch', true, true);
        await copy('v2/babel');
        transpile('v2/babel');
        await server.start('v2/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            return await window.api.ComplexService.complexTypes({
                parameterObject: {
                    first: {
                        second: {
                            third: 'Hello World!'
                        }
                    }
                }
            });
        });
        expect(result).toBeDefined();
    });
});
