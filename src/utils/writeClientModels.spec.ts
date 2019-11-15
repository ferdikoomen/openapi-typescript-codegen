import { writeClientModels } from './writeClientModels';
import * as fs from 'fs';
import { Model } from '../client/interfaces/Model';
import { Language } from '../index';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientModels', () => {
    it('should write to filesystem', () => {
        const models: Model[] = [
            {
                isInterface: false,
                isType: false,
                isEnum: false,
                name: 'Item',
                type: 'Item',
                base: 'Item',
                template: null,
                validation: null,
                description: null,
                extends: [],
                imports: [],
                symbols: [],
                properties: [],
                enums: [],
            },
        ];
        const template = () => 'dummy';
        writeClientModels(models, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
