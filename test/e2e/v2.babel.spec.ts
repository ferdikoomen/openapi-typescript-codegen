import {
    executeBrowserTestsWithInstanceClient,
    executeBrowserTestsWithStaticClient,
    executeBrowserTestsWithStaticClientOptionsTrue,
} from './tests';
import { compileWithBabel } from './scripts/compileWithBabel';

describe('v2/babel', () => {
    describe('static client', () => {
        executeBrowserTestsWithStaticClient('v2/babel', 'v2', 'fetch', false, true, false, compileWithBabel);
    });

    describe('static client with options', () => {
        executeBrowserTestsWithStaticClientOptionsTrue('v2/babel_options', 'v2', 'fetch', compileWithBabel);
    });

    describe('instance client', () => {
        executeBrowserTestsWithInstanceClient('v2/babel_client', 'v2', 'fetch', false, true, true, compileWithBabel);
    });
});
