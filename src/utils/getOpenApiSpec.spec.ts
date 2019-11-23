import * as fs from 'fs';
import { getOpenApiSpec } from './getOpenApiSpec';

jest.mock('fs');

const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe('getOpenApiSpec', () => {
    it('should read the json file', () => {
        fsExistsSync.mockReturnValue(true);
        fsReadFileSync.mockReturnValue('{"message": "Hello World!"}');
        const spec = getOpenApiSpec('spec.json');
        expect(spec.message).toEqual('Hello World!');
    });

    it('should read the yaml file', () => {
        fsExistsSync.mockReturnValue(true);
        fsReadFileSync.mockReturnValue('message: "Hello World!"');
        const spec = getOpenApiSpec('spec.yaml');
        expect(spec.message).toEqual('Hello World!');
    });
});
