import { exists, readFile } from './fileSystem';
import { getOpenApiSpec } from './getOpenApiSpec';

jest.mock('./fileSystem');

const existsMocked = exists as jest.MockedFunction<typeof exists>;
const readFileMocked = readFile as jest.MockedFunction<typeof readFile>;

function mockPromise<T>(value: T): Promise<T> {
    return new Promise<T>(resolve => resolve(value));
}

describe('getOpenApiSpec', () => {
    it('should read the json file', async () => {
        existsMocked.mockReturnValue(mockPromise(true));
        readFileMocked.mockReturnValue(mockPromise('{"message": "Hello World!"}'));
        const spec = await getOpenApiSpec('spec.json');
        expect(spec.message).toEqual('Hello World!');
    });

    it('should read the yaml file', async () => {
        existsMocked.mockReturnValue(mockPromise(true));
        readFileMocked.mockReturnValue(mockPromise('message: "Hello World!"'));
        const spec = await getOpenApiSpec('spec.yaml');
        expect(spec.message).toEqual('Hello World!');
    });
});
