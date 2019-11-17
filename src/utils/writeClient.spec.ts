import { writeClient } from './writeClient';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import { Client } from '../client/interfaces/Client';
import { Templates } from './readHandlebarsTemplates';
import { Language } from '../index';
import * as glob from 'glob';
import { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';

jest.mock('rimraf');
jest.mock('mkdirp');
jest.mock('fs');
jest.mock('glob');

const rimrafSync = mkdirp.sync as jest.MockedFunction<typeof mkdirp.sync>;
const mkdirpSync = rimraf.sync as jest.MockedFunction<typeof rimraf.sync>;
const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;
const globSync = glob.sync as jest.MockedFunction<typeof glob.sync>;

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
            interface: () => 'dummy',
            service: () => 'dummy',
        };

        globSync.mockReturnValue([]);

        writeClient(client, Language.TYPESCRIPT, templates, '/');

        expect(rimrafSync).toBeCalled();
        expect(mkdirpSync).toBeCalled();
        expect(fsWriteFileSync).toBeCalled();
        expect(globSync).toBeCalled();
    });
});
