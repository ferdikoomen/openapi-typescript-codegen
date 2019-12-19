import * as fs from 'fs';
import { Language } from '../index';
import { Service } from '../client/interfaces/Service';
import { Templates } from './readHandlebarsTemplates';
import { writeClientServices } from './writeClientServices';

jest.mock('fs');

const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

describe('writeClientServices', () => {
    it('should write to filesystem', () => {
        const services: Service[] = [];
        services.push({
            name: 'Item',
            operations: [],
            imports: [],
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

        writeClientServices(services, templates, '/');

        expect(fsWriteFileSync).toBeCalledWith('/Item.ts', 'dummy');
    });
});
