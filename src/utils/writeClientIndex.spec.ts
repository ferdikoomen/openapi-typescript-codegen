import { writeClientIndex } from './writeClientIndex';
import * as fs from 'fs';
import { Client } from '../client/interfaces/Client';
import { Language } from '../index';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientIndex', () => {
    it('should write to filesystem', () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };
        const template = () => 'dummy';
        writeClientIndex(client, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/index.ts', 'dummy');
    });
});
