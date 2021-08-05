import { executeNodeTestsWithStaticClient, executeNodeTestsWithInstanceClient } from './tests';

describe('v3/node', () => {
    describe('static client', () => {
        executeNodeTestsWithStaticClient('v3/node', 'v3', 'node');
    });

    describe('instance client', () => {
        executeNodeTestsWithInstanceClient('v3/node_client', 'v3', 'node');
    });
});
