import {
    executeBrowserTestsWithInstanceClient,
    executeBrowserTestsWithStaticClient,
    executeBrowserTestsWithStaticClientOptionsTrue,
} from './tests';
import { compileWithTypescript } from './scripts/compileWithTypescript';

describe('v2/xhr', () => {
    describe('static client', () => {
        executeBrowserTestsWithStaticClient('v2/xhr', 'v2', 'xhr', false, false, false, compileWithTypescript);
    });

    describe('static client with options', () => {
        executeBrowserTestsWithStaticClientOptionsTrue('v2/xhr_options', 'v2', 'xhr', compileWithTypescript);
    });

    describe('instance client', () => {
        executeBrowserTestsWithInstanceClient('v2/xhr_client', 'v2', 'xhr', false, false, true, compileWithTypescript);
    });
});
