import * as fs from 'fs';
import * as glob from 'glob';
import { Client } from '../client/interfaces/Client';
import { Language } from '../index';
import { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';
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
            models: new Map<string, Model>(),
            services: new Map<string, Service>(),
        };

        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            service: () => 'dummy',
            settings: () => 'dummy',
        };

        globSync.mockReturnValue([]);

        writeClientIndex(client, Language.TYPESCRIPT, templates, '/', '/', '/');

        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
