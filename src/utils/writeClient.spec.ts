import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { Templates } from './readHandlebarsTemplates';
import { writeClient } from './writeClient';

jest.mock('rimraf');
jest.mock('mkdirp');
jest.mock('fs');

const rimrafSync = mkdirp.sync as jest.MockedFunction<typeof mkdirp.sync>;
const mkdirpSync = rimraf.sync as jest.MockedFunction<typeof rimraf.sync>;
const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClient', () => {
    it('should write to filesystem', () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
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

        writeClient(client, templates, '/', HttpClient.FETCH, false, true, true, true, true);

        expect(rimrafSync).toBeCalled();
        expect(mkdirpSync).toBeCalled();
        expect(fsWriteFileSync).toBeCalled();
    });
});
