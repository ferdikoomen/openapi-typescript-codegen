import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientSettings } from './writeClientSettings';

jest.mock('./fileSystem');

describe('writeClientSettings', () => {
    it('should write to filesystem', async () => {
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

        await writeClientSettings(client, templates, '/', HttpClient.FETCH);

        expect(writeFile).toBeCalledWith('/OpenAPI.ts', 'dummy');
    });
});
