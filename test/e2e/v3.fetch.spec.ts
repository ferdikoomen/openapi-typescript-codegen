import { executeBrowserTestsWithInstanceClient, executeBrowserTestsWithStaticClient } from './tests';
import { compileWithTypescript } from './scripts/compileWithTypescript';

describe('v3/fetch', () => {
    describe('static client', () => {
        executeBrowserTestsWithStaticClient('v3/fetch', 'v3', 'fetch', false, false, false, compileWithTypescript);
    });

    describe('instance client', () => {
        executeBrowserTestsWithInstanceClient(
            'v3/fetch_client',
            'v3',
            'fetch',
            false,
            true,
            true,
            compileWithTypescript
        );
    });
});
