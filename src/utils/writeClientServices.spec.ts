import type { Service } from '../client/interfaces/Service';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientServices } from './writeClientServices';

jest.mock('./fileSystem');

describe('writeClientServices', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];

        await writeClientServices(services, templates, '/', HttpClient.FETCH, false, Indent.SPACE_4, 'Service');

        expect(writeFile).toBeCalledWith('/UserService.ts', `service${EOL}`);
    });
});
