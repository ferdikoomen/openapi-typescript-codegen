import { executeNodeTestsWithStaticClient, executeNodeTestsWithInstanceClient } from './tests';

describe('v2/node', () => {
    describe('static client', () => {
        executeNodeTestsWithStaticClient('v2/node', 'v2', 'node');
    });

    describe('instance client', () => {
        executeNodeTestsWithInstanceClient('v2/node_client', 'v2', 'node');
    });
});
