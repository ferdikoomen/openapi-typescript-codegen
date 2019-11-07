import { writeClientIndex } from './writeClientIndex';
import * as fs from 'fs';
import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';
import { Language } from '../index';

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
        const template = () => 'dummy';
        writeClientIndex(client, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
