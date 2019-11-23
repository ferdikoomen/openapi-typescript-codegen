import { Language } from '../index';
import { getFileName } from './getFileName';

describe('getFileName', () => {
    it('should convert to correct file name', () => {
        expect(getFileName('file', Language.TYPESCRIPT)).toEqual('file.ts');
        expect(getFileName('file', Language.JAVASCRIPT)).toEqual('file.js');
    });
});
