import type { Service } from '../client/interfaces/Service';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientClients } from './writeClientClients';

jest.mock('./fileSystem');

describe('writeClientClients', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];

        await writeClientClients(services, './factories.ts', templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/User.ts', `clientResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `clientIndex${EOL}`);
    });
});
