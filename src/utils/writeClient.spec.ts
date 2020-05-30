import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { mkdir, rmdir, writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClient } from './writeClient';

jest.mock('./fileSystem');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
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

        await writeClient(client, templates, '/', HttpClient.FETCH, false, true, true, true, true);

        expect(rmdir).toBeCalled();
        expect(mkdir).toBeCalled();
        expect(writeFile).toBeCalled();
    });
});
