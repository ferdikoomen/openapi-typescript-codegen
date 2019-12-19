import * as fs from 'fs';
import * as glob from 'glob';
import { Language } from '../index';
import { readHandlebarsTemplates } from './readHandlebarsTemplates';

jest.mock('fs');
jest.mock('glob');

const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
const globSync = glob.sync as jest.MockedFunction<typeof glob.sync>;

describe('readHandlebarsTemplates', () => {
    it('should read the templates', () => {
        fsExistsSync.mockReturnValue(true);
        fsReadFileSync.mockReturnValue('{{{message}}}');
        globSync.mockReturnValue([]);

        const template = readHandlebarsTemplates();

        expect(template).toBeDefined();
        expect(template.model).toBeDefined();
        expect(template.models).toBeDefined();
        expect(template.service).toBeDefined();
        expect(template.services).toBeDefined();
        expect(template.settings).toBeDefined();
        expect(template.model({ message: 'Hello World!' })).toEqual('Hello World!');
        expect(template.models({ message: 'Hello World!' })).toEqual('Hello World!');
        expect(template.service({ message: 'Hello World!' })).toEqual('Hello World!');
        expect(template.services({ message: 'Hello World!' })).toEqual('Hello World!');
        expect(template.settings({ message: 'Hello World!' })).toEqual('Hello World!');
    });
});
