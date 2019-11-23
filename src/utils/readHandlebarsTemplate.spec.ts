import * as fs from 'fs';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';

jest.mock('fs');

const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe('readHandlebarsTemplate', () => {
    it('should read the template', () => {
        fsExistsSync.mockReturnValue(true);
        fsReadFileSync.mockReturnValue('{{{message}}}');

        const template = readHandlebarsTemplate('/');

        expect(template).toBeDefined();
        expect(template({ message: 'Hello World!' })).toEqual('Hello World!');
    });
});
