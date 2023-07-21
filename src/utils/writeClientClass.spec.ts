import type { Client } from '../client/interfaces/Client';

import { templates } from './__mocks__/templates';
import { HttpClient } from '../HttpClient';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientClass } from './writeClientClass';

jest.mock('./fileSystem');

describe('writeClientClass', () => {
    it('should write to filesystem', async () => {
        const client: Client = {
            server: 'http://localhost:8080',
            version: 'v1',
            models: [],
            services: [],
        };

        await writeClientClass(client, templates, './dist', HttpClient.FETCH, 'AppClient', Indent.SPACE_4, '');

        expect(writeFile).toBeCalled();
    });
});
