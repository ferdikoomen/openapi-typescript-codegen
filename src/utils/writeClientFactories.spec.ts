import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { writeFile } from './fileSystem';
import { writeClientFactories } from './writeClientFactories';
import { Indent } from '../Indent';
import { Service } from '../client/interfaces/Service';

jest.mock('./fileSystem');

describe('writeClientFactories', () => {
    it('should write to filesystem', async () => {
        const services: Service[] = [
            {
                name: 'User',
                operations: [],
                imports: [],
            },
        ];
        await writeClientFactories(services, templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/createServerResolver.ts', `serverResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/createClientResolver.ts', `clientResolver${EOL}`);
        expect(writeFile).toBeCalledWith('/createHook.ts', `hook${EOL}`);
        expect(writeFile).toBeCalledWith('/index.ts', `factoriesIndex${EOL}`);
    });
});
