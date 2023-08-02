import type { Client } from '../client/interfaces/Client';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { mkdir, rmdir, writeFile } from './fileSystem';
import { writeClient } from './writeClient';

jest.mock('./fileSystem');

describe('writeClient', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };

        await writeClient(client, templates, './dist', './factories.ts', false, true, true, Indent.SPACE_4, 'Model');

        expect(rmdir).toBeCalled();
        expect(mkdir).toBeCalled();
        expect(writeFile).toBeCalled();
    });
});
