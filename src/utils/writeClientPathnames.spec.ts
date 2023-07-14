import type { Service } from '../client/interfaces/Service';
import type { Templates } from './registerHandlebarTemplates';

import { EOL } from 'os';

import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientPathnames } from './writeClientPathnames';

jest.mock('./fileSystem');

describe('writeClientPathnames', () => {
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

        await writeClientPathnames(services, templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/User.ts', `pathname${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `pathnameIndex${EOL}`);
    });
});
