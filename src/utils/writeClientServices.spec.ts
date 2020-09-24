import { Service } from '../client/interfaces/Service';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'MyService',
                operations: [],
                imports: [],
            },
        ];

        const templates: Templates = {
            index: () => 'index',
            exports: {
                model: () => 'model',
                schema: () => 'schema',
                service: () => 'service',
            },
            core: {
                settings: () => 'settings',
                apiError: () => 'apiError',
                getFormData: () => 'getFormData',
                getQueryString: () => 'getQueryString',
                isSuccess: () => 'isSuccess',
                request: () => 'request',
                requestOptions: () => 'requestOptions',
                requestUsingFetch: () => 'requestUsingFetch',
                requestUsingXHR: () => 'requestUsingXHR',
                result: () => 'result',
            },
        };

        await writeClientServices(services, templates, '/', false);

        expect(writeFile).toBeCalledWith('/MyService.ts', 'service');
    });
});
