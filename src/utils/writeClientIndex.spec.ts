import * as fs from 'fs';
import * as glob from 'glob';
import { Client } from '../client/interfaces/Client';
import { Templates } from './readHandlebarsTemplates';
import { writeClientIndex } from './writeClientIndex';

jest.mock('fs');
jest.mock('glob');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;
const globSync = glob.sync as jest.MockedFunction<typeof glob.sync>;

describe('writeClientIndex', () => {
    it('should write to filesystem', () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            schema: () => 'dummy',
            service: () => 'dummy',
            settings: () => 'dummy',
        };

        globSync.mockReturnValue([]);

        writeClientIndex(client, templates, '/');

        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
