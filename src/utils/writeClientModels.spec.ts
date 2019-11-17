import { writeClientModels } from './writeClientModels';
import * as fs from 'fs';
import { Model } from '../client/interfaces/Model';
import { Language } from '../index';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientModels', () => {
    it('should write to filesystem', () => {
        const models = new Map<string, Model>();
        models.set('Item', {
            name: 'Item',
            type: 'Item',
            base: 'Item',
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            properties: [],
        });
        const template = () => 'dummy';
        writeClientModels(models, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
