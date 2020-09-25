'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('v3.fetch', () => {

    beforeAll(async () => {
        await generate('v3', 'fetch');
        await copy('v3', 'fetch');
        await compile('v3', 'fetch');
        await server.start('v3', 'fetch');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('runs', async () => {
        expect(true).toBeTruthy();
    });

});
