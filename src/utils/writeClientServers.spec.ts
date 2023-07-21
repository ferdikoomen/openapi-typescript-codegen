import type { Service } from '../client/interfaces/Service';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientServers } from './writeClientServers';

jest.mock('./fileSystem');

describe('writeClientServers', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];

        await writeClientServers(services, './factories.ts', templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/User.ts', `sererResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `serverIndex${EOL}`);
    });
});
