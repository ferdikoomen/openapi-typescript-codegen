'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');

describe('v2.node', () => {

    beforeAll(async () => {
        await generate('v2/node', 'v2', 'node');
        compile('v2/node');
        await server.start('v2/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('complexService', async () => {
        const {ComplexService} = require('./generated/v2/node/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!'
                }
            }
        });
        expect(result).toBeDefined();
    });

});
