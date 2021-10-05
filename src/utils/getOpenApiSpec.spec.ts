import RefParser from 'json-schema-ref-parser';

import { exists, readFile } from './fileSystem';
import { getOpenApiSpec } from './getOpenApiSpec';

jest.mock('./fileSystem');
jest.mock('json-schema-ref-parser');

const existsMocked = exists as jest.MockedFunction<typeof exists>;
const readFileMocked = readFile as jest.MockedFunction<typeof readFile>;
const bundleMocked = RefParser.bundle as jest.MockedFunction<typeof RefParser.bundle>;

function mockPromise<T>(value: T): Promise<T> {
    return new Promise<T>(resolve => resolve(value));
}

describe('getOpenApiSpec', () => {
    const fixture = {
        message: 'Hello World!',
    };

    existsMocked.mockReturnValue(mockPromise(true));
    bundleMocked.mockReturnValue(mockPromise(fixture));
    readFileMocked.mockReturnValue(mockPromise(JSON.stringify(fixture)));

    it('should read the json file', async () => {
        const spec = await getOpenApiSpec('spec.json');
        expect(spec.message).toEqual('Hello World!');
    });

    it('should read the yaml file', async () => {
        const spec = await getOpenApiSpec('spec.yaml');
        expect(spec.message).toEqual('Hello World!');
    });

    it('should throw an error if the json is not valid', async () => {
        readFileMocked.mockReturnValueOnce(mockPromise('not json'));
        await expect(getOpenApiSpec('spec.json')).rejects.toThrow('Could not parse OpenApi JSON');
    });

    it('should throw an error if the json is not valid', async () => {
        readFileMocked.mockReturnValueOnce(
            mockPromise(`
        asfiasdfm:
          asdfasdf -
          asdf: asdf; -
        kasdfjasdf
      `)
        );
        await expect(getOpenApiSpec('spec.yaml')).rejects.toThrow('Could not parse OpenApi YAML');
    });
});
