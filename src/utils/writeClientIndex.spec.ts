import { Client } from '../client/interfaces/Client';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientIndex } from './writeClientIndex';

jest.mock('./fileSystem');

describe('writeClientIndex', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: '1.0',
            models: [],
            services: [],
        };

        const templates: Templates = {
            index: () => 'index',
            exports: {
                model: () => 'model',
                schema: () => 'schema',
                service: () => 'service',
            },
            core: {
                settings: () => 'settings',
                getFormData: () => 'getFormData',
                getQueryString: () => 'getQueryString',
                getUrl: () => 'getUrl',
                isSuccess: () => 'isSuccess',
                catchGenericError: () => 'catchGenericError',
                request: () => 'request',
                requestOptions: () => 'requestOptions',
                requestUsingFetch: () => 'requestUsingFetch',
                requestUsingXHR: () => 'requestUsingXHR',
                requestUsingNode: () => 'requestUsingNode',
                response: () => 'response',
                responseError: () => 'responseError',
            },
        };

        await writeClientIndex(client, templates, '/', true, true, true, true);

        expect(writeFile).toBeCalledWith('/index.ts', 'index');
    });
});
