import { writeClientModels } from './writeClientModels';
import * as fs from 'fs';
import { Model } from '../client/interfaces/Model';
import { Language } from '../index';
import { Templates } from './readHandlebarsTemplates';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientModels', () => {
    it('should write to filesystem', () => {
        const models = new Map<string, Model>();
        models.set('Item', {
            name: 'Item',
            type: 'Item',
            base: 'Item',
            template: null,
            link: null,
            description: null,
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
            validation: null,
        });
        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            exportInterface: () => 'dummy',
            exportEnum: () => 'dummy',
            exportType: () => 'dummy',
            service: () => 'dummy',
            validation: () => 'dummy',
            type: () => 'dummy',
        };
        writeClientModels(models, Language.TYPESCRIPT, templates, '/');
        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
