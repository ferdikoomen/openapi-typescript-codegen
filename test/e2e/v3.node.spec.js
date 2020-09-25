'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');

let tests;

describe('v3.node', () => {

    beforeAll(async () => {
        await generate('v3', 'node');
        await copy('v3', 'node');
        await compile('v3', 'node');
        await server.start('v3', 'node');
        tests = require('./generated/v3/node/index.js');
    }, 30000);

    afterAll(async () => {
        await server.stop();
        tests = null;
    });

    it('runs', async () => {
        console.log(app);
        expect(true).toBeTruthy();
    });

});
