import { Model } from '../client/interfaces/Model';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientSchemas } from './writeClientSchemas';

jest.mock('./fileSystem');

describe('writeClientSchemas', () => {
    it('should write to filesystem', async () => {
        const models: Model[] = [
            {
                export: 'interface',
                name: 'MyModel',
                type: 'MyModel',
                base: 'MyModel',
                template: null,
                link: null,
                description: null,
                isDefinition: true,
                isReadOnly: false,
                isRequired: false,
                isNullable: false,
                imports: [],
                extends: [],
                enum: [],
                enums: [],
                properties: [],
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

        await writeClientSchemas(models, templates, '/');

        expect(writeFile).toBeCalledWith('/$MyModel.ts', 'schema');
    });
});
