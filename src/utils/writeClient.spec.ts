import { writeClient } from './writeClient';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { Templates } from './readHandlebarsTemplates';
import { Service } from '../client/interfaces/Service';
import { Language } from '../index';

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
            models: new Map<string, Model>(),
            services: new Map<string, Service>(),
        };

        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            service: () => 'dummy',
        };

        writeClient(client, Language.TYPESCRIPT, templates, '/');

        expect(rimrafSync).toBeCalled();
        expect(mkdirpSync).toBeCalled();
        expect(fsWriteFileSync).toBeCalled();
    });
});
