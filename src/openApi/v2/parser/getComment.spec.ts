import * as os from 'os';

import { getComment } from './getComment';

describe('getComment', () => {
    it('should parse comments', () => {
        const multiline = 'Testing multiline comments.' + os.EOL + ' * This must go to the next line.' + os.EOL + ' * ' + os.EOL + ' * This will contain a break.';
        expect(getComment('')).toEqual(null);
        expect(getComment('Hello')).toEqual('Hello');
        expect(getComment('Hello World!')).toEqual('Hello World!');
        expect(getComment('Testing multiline comments.\nThis must go to the next line.\n\nThis will contain a break.')).toEqual(multiline);
        expect(getComment('Testing multiline comments.\r\nThis must go to the next line.\r\n\r\nThis will contain a break.')).toEqual(multiline);
    });
});
