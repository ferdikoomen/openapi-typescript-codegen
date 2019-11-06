import { writeClientServices } from './writeClientServices';
import * as fs from 'fs';
import { Service } from '../client/interfaces/Service';
import { Language } from '../index';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientServices', () => {
    it('should write to filesystem', () => {
        const services: Service[] = [
            {
                name: 'Item',
                operations: [],
                imports: [],
            },
        ];
        const template = () => 'dummy';
        writeClientServices(services, Language.TYPESCRIPT, template, '/');
        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
