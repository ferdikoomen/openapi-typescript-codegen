import { EOL } from 'os';

import { templates } from './__mocks__/templates';
import { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { writeClientUtil } from './writeClientUtil';

jest.mock('./fileSystem');

describe('writeClientUtil', () => {
    it('should write to filesystem', async () => {
        await writeClientUtil(templates, '/', Indent.SPACE_4);

        expect(writeFile).toBeCalledWith('/createRequestParams.ts', `createRequestParams content${EOL}`);
    });
});
