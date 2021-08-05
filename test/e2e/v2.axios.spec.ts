import { executeNodeTestsWithInstanceClient, executeNodeTestsWithStaticClient } from './tests';

describe('v2/axios', () => {
    describe('static client', () => {
        executeNodeTestsWithStaticClient('v2/axios', 'v2', 'axios');
    });

    describe('instance client', () => {
        executeNodeTestsWithInstanceClient('v2/axios_client', 'v2', 'axios');
    });
});
