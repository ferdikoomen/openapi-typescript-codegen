import * as fs from 'fs';

import { Client } from '../client/interfaces/Client';
import { Templates } from './readHandlebarsTemplates';
import { writeClientIndex } from './writeClientIndex';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

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

        writeClientIndex(client, templates, '/', true, true);

        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
