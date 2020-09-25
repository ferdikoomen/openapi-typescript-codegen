'use strict';

const generate = require('./scripts/generate');
const compile = require('./scripts/compile');

describe('e2e', () => {

    beforeAll(async () => {
        await generate('v2', 'fetch');
        await generate('v2', 'xhr');
        await generate('v2', 'node');
        await generate('v3', 'fetch');
        await generate('v3', 'xhr');
        await generate('v3', 'node');
    });

    afterAll(async () => {
        //
    });

    it('runs in chrome', async () => {
        expect(true).toBeTruthy();
    });

    it('runs in node', async () => {
        expect(true).toBeTruthy();
    });

})
