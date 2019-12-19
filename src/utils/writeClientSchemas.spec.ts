import * as fs from 'fs';
import { Model } from '../client/interfaces/Model';
import { Templates } from './readHandlebarsTemplates';
import { writeClientModels } from './writeClientModels';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientModels', () => {
    it('should write to filesystem', () => {
        const models: Model[] = [];
        models.push({
            export: 'interface',
            name: 'Item',
            type: 'Item',
            base: 'Item',
            template: null,
            link: null,
            description: null,
            isProperty: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });

        const templates: Templates = {
            model: () => 'dummy',
            models: () => 'dummy',
            schema: () => 'dummy',
            schemas: () => 'dummy',
            service: () => 'dummy',
            services: () => 'dummy',
            settings: () => 'dummy',
        };

        writeClientModels(models, templates, '/');

        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
