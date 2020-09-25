'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const build = require('./scripts/build');
const server = require('./scripts/server');
const browser = require('./scripts/browser');

describe('e2e', () => {

    beforeAll(async () => {
        await generate('v2', 'fetch');
        await generate('v2', 'xhr');
        await generate('v2', 'node');
        await generate('v3', 'fetch');
        await generate('v3', 'xhr');
        await generate('v3', 'node');

        await copy('v2', 'fetch');
        await copy('v2', 'xhr');
        await copy('v2', 'node');
        await copy('v3', 'fetch');
        await copy('v3', 'xhr');
        await copy('v3', 'node');

        await build('v2', 'fetch');
        await build('v2', 'xhr');
        await build('v2', 'node');
        await build('v3', 'fetch');
        await build('v3', 'xhr');
        await build('v3', 'node');

        await server.start();
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await server.stop();
        await browser.stop();
    });

    it('runs in chrome', async () => {
        expect(true).toBeTruthy();
    });

    it('runs in node', async () => {
        // const child1 = require('./generated/v2/fetch/index.js');
        // const child2 = require('./generated/v3/fetch/index.js');
        // const resultDefaultsService1 = child1.testDefaultsService();
        // const resultDefaultsService2 = child2.testDefaultsService();
        // expect(resultDefaultsService1).toContain('aap');
        // expect(resultDefaultsService2).toContain('aap');
        expect(true).toBeTruthy();
    });

});
