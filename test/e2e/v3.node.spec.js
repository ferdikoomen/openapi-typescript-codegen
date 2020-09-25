'use strict';

const generate = require('./scripts/generate');
const copy = require('./scripts/copy');
const compile = require('./scripts/compile');
const server = require('./scripts/server');

describe('v3.node', () => {

    beforeAll(async () => {
        await generate('v3', 'node');
        await copy('v3', 'node');
        await compile('v3', 'node');
        await server.start('v3', 'node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('complexService', async () => {
        const { ComplexService } = require('./generated/v3/node/index.js');
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
