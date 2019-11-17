import { writeClientIndex } from './writeClientIndex';
import * as fs from 'fs';
import { Client } from '../client/interfaces/Client';
import { Language } from '../index';
import { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';
import { Templates } from './readHandlebarsTemplates';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientIndex', () => {
    it('should write to filesystem', () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: new Map<string, Model>(),
            services: new Map<string, Service>(),
        };
        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            exportInterface: () => 'dummy',
            exportEnum: () => 'dummy',
            exportType: () => 'dummy',
            service: () => 'dummy',
            validation: () => 'dummy',
            type: () => 'dummy',
        };
        writeClientIndex(client, Language.TYPESCRIPT, templates, '/');
        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
