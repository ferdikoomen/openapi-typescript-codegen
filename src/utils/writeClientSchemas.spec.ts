import * as fs from 'fs';
import { Schema } from '../client/interfaces/Schema';
import { writeClientSchemas } from './writeClientSchemas';
import { Language } from '../index';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientSchemas', () => {
    it('should write to filesystem', () => {
        const schemas: Schema[] = [
            {
                name: 'Item',
                base: 'Item',
                imports: [],
            },
        ];
        const template = () => 'dummy';
        writeClientSchemas(schemas, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
