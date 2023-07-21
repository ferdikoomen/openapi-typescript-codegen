import type { Client } from '../client/interfaces/Client';

import { templates } from './__mocks__/templates';
import { HttpClient } from '../HttpClient';
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

        await writeClient(
            client,
            templates,
            './dist',
            './factories.ts',
            HttpClient.FETCH,
            false,
            true,
            true,
            true,
            Indent.SPACE_4,
            'Service',
            'AppClient'
        );

        expect(rmdir).toBeCalled();
        expect(mkdir).toBeCalled();
        expect(writeFile).toBeCalled();
    });
});
