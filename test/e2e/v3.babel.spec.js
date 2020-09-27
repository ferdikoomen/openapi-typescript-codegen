'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const transpile = require('./scripts/transpile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v3.fetch', () => {

    beforeAll(async () => {
        await generate('v3/babel', 'v3', 'fetch', true, true);
        await copy('v3/babel');
        transpile('v3/babel');
        await server.start('v3/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('runs', async () => {
        expect(true).toBeTruthy();
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
