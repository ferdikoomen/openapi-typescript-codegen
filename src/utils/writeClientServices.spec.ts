import { Service } from '../client/interfaces/Service';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'Item',
                operations: [],
                imports: [],
            },
        ];

        const templates: Templates = {
            index: () => 'dummy',
            model: () => 'dummy',
            schema: () => 'dummy',
            service: () => 'dummy',
            settings: () => 'dummy',
        };

        await writeClientServices(services, templates, '/', false);

        expect(writeFile).toBeCalledWith('/Item.ts', 'dummy');
    });
});
