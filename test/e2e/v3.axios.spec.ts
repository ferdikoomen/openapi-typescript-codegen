import { executeNodeTestsWithInstanceClient, executeNodeTestsWithStaticClient } from './tests';

describe('v3/axios', () => {
    describe('static client', () => {
        executeNodeTestsWithStaticClient('v3/axios', 'v3', 'axios');
    });

    describe('instance client', () => {
        executeNodeTestsWithInstanceClient('v3/axios_client', 'v3', 'axios');
    });
});
