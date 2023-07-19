import type { Templates } from './registerHandlebarTemplates';

import { EOL } from 'os';

import { writeFile } from './fileSystem';
import { writeClientFactories } from './writeClientFactories';
import { Indent } from '../Indent';

jest.mock('./fileSystem');

describe('writeClientFactories', () => {
    it('should write to filesystem', async () => {
        const templates: Templates = {
            index: () => 'index',
            client: () => 'client',
            exports: {
                pathnames: {
                    pathname: () => 'pathname',
                    index: () => 'pathnameIndex',
                },
                factories: {
                    serverResolver: () => 'serverResolver',
                    clientResolver: () => 'clientResolver',
                    hook: () => 'hook',
                    index: () => 'factoriesIndex',
                },
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
                baseHttpRequest: () => 'baseHttpRequest',
                httpRequest: () => 'httpRequest',
            },
        };

        await writeClientFactories(templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/createServerResolver.ts', `serverResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/createClientResolver.ts', `clientResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/createHook.ts', `hook${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `factoriesIndex${EOL}`);
    });
});
