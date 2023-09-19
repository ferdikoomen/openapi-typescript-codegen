import type { Service } from '../client/interfaces/Service';

import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientPathnames } from './writeClientPathnames';

jest.mock('./fileSystem');

describe('writeClientPathnames', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];

        await writeClientPathnames(services, templates, '/', Indent.SPACE_4, false);

        expect(writeFile).toBeCalledWith('/User.ts', `pathname${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `pathnameIndex${EOL}`);
    });
});
