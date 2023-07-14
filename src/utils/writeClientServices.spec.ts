import type { Service } from '../client/interfaces/Service';
import type { Templates } from './registerHandlebarTemplates';

import { EOL } from 'os';

import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];

        const templates: Templates = {
            index: () => 'index',
            client: () => 'client',
            exports: {
                pathname: () => 'pathname',
                pathnameIndex: () => 'pathnameIndex',
                model: () => 'model',
                schema: () => 'schema',
                service: () => 'service',
            },
            core: {
                settings: () => 'settings',
                apiError: () => 'apiError',
                apiRequestOptions: () => 'apiRequestOptions',
                apiResult: () => 'apiResult',
                cancelablePromise: () => 'cancelablePromise',
                request: () => 'request',
                baseHttpRequest: () => 'baseHttpRequest',
                httpRequest: () => 'httpRequest',
            },
        };

        await writeClientServices(services, templates, '/', HttpClient.FETCH, false, Indent.SPACE_4, 'Service');

        expect(writeFile).toBeCalledWith('/UserService.ts', `service${EOL}`);
    });
});
