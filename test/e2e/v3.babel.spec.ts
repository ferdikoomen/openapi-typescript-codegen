import {
    executeBrowserTestsWithInstanceClient,
    executeBrowserTestsWithStaticClient,
    executeBrowserTestsWithStaticClientOptionsTrue,
} from './tests';
import { compileWithBabel } from './scripts/compileWithBabel';

describe('v3/babel', () => {
    describe('static client', () => {
        executeBrowserTestsWithStaticClient('v3/babel', 'v3', 'fetch', false, true, false, compileWithBabel);
    });

    describe('static client with options', () => {
        executeBrowserTestsWithStaticClientOptionsTrue('v2/babel_options', 'v2', 'fetch', compileWithBabel);
    });

    describe('instance client', () => {
        executeBrowserTestsWithInstanceClient('v3/babel_client', 'v3', 'fetch', false, true, true, compileWithBabel);
    });
});
