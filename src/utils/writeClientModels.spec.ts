import type { Model } from '../client/interfaces/Model';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientModels } from './writeClientModels';

jest.mock('./fileSystem');

describe('writeClientModels', () => {
    it('should write to filesystem', async () => {
        const models: Model[] = [
            {
                export: 'interface',
                name: 'User',
                type: 'User',
                base: 'User',
                template: null,
                link: null,
                description: null,
                isDefinition: true,
                isReadOnly: false,
                isRequired: false,
                isNullable: false,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
            },
        ];

        await writeClientModels(models, templates, '/', HttpClient.FETCH, false, Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/User.ts', `model${EOL}`);
    });
});
