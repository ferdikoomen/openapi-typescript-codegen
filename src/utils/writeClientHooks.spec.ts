import type { Service } from '../client/interfaces/Service';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientHooks } from './writeClientHooks';

jest.mock('./fileSystem');

describe('writeClientHooks', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [
                    {
                        service: 'service',
                        name: 'name',
                        summary: 'summary',
                        description: 'description',
                        deprecated: false,
                        method: 'GET',
                        path: 'path',
                        errors: [],
                        results: [],
                        responseHeader: 'responseHeader',
                        imports: [],
                        parameters: [],
                        parametersPath: [],
                        parametersQuery: [],
                        parametersForm: [],
                        parametersCookie: [],
                        parametersHeader: [],
                        parametersBody: null,
                    },
                ],
                imports: [],
            },
        ];

        await writeClientHooks(services, './factories.ts', templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/User.ts', `hookResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `hookIndex${EOL}`);
    });
});
