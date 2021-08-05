import { executeBrowserTestsWithInstanceClient, executeBrowserTestsWithStaticClient } from './tests';
import { compileWithTypescript } from './scripts/compileWithTypescript';

describe('v3/xhr', () => {
    describe('static client', () => {
        executeBrowserTestsWithStaticClient('v3/xhr', 'v3', 'xhr', false, false, false, compileWithTypescript);
    });

    describe('instance client', () => {
        executeBrowserTestsWithInstanceClient('v3/xhr_client', 'v3', 'xhr', false, true, true, compileWithTypescript);
    });
});
