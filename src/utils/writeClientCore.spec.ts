import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';

jest.mock('./fileSystem');

describe('writeClientCore', () => {
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

        await writeClientCore(client, templates, '/', HttpClient.FETCH);

        expect(writeFile).toBeCalledWith('/OpenAPI.ts', 'settings');
        expect(writeFile).toBeCalledWith('/getFormData.ts', 'getFormData');
        expect(writeFile).toBeCalledWith('/getQueryString.ts', 'getQueryString');
        expect(writeFile).toBeCalledWith('/getUrl.ts', 'getUrl');
        expect(writeFile).toBeCalledWith('/isSuccess.ts', 'isSuccess');
        expect(writeFile).toBeCalledWith('/catchGenericError.ts', 'catchGenericError');
        expect(writeFile).toBeCalledWith('/request.ts', 'request');
        expect(writeFile).toBeCalledWith('/RequestOptions.ts', 'requestOptions');
        expect(writeFile).toBeCalledWith('/requestUsingFetch.ts', 'requestUsingFetch');
        expect(writeFile).toBeCalledWith('/requestUsingXHR.ts', 'requestUsingXHR');
        expect(writeFile).toBeCalledWith('/requestUsingNode.ts', 'requestUsingNode');
        expect(writeFile).toBeCalledWith('/Response.ts', 'response');
        expect(writeFile).toBeCalledWith('/ResponseError.ts', 'responseError');
    });
});
