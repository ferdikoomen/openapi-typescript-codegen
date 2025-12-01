import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import {
    performHeaderParmeterAssertions,
    performPathParameterAssertions,
    performQueryParameterAssertions,
} from './scripts/parameterSerializerAssertions';
import server from './scripts/server';

describe('v3.node', () => {
    beforeAll(async () => {
        cleanup('v3/node');
        await generateClient('v3/node', 'v3', 'node');
        compileWithTypescript('v3/node');
        await server.start('v3/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/node/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        OpenAPI.USERNAME = undefined;
        OpenAPI.PASSWORD = undefined;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v3/node/index.js');
        OpenAPI.TOKEN = undefined;
        OpenAPI.USERNAME = 'username';
        OpenAPI.PASSWORD = 'password';
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v3/node/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('support form data', async () => {
        const { ParametersService } = require('./generated/v3/node/index.js');
        const result = await ParametersService.callWithParameters(
            'valueHeader',
            'valueQuery',
            'valueForm',
            'valueCookie',
            'valuePath',
            {
                prop: 'valueBody',
            }
        );
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            const { SimpleService } = require('./generated/v3/node/index.js');
            const promise = SimpleService.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('Request aborted');
    });

    it('should throw known error (500)', async () => {
        let error;
        try {
            const { ErrorService } = require('./generated/v3/node/index.js');
            await ErrorService.testErrorCode(500);
        } catch (e) {
            const err = e as any;
            error = JSON.stringify({
                name: err.name,
                message: err.message,
                url: err.url,
                status: err.status,
                statusText: err.statusText,
                body: err.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Custom message: Internal Server Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=500',
                status: 500,
                statusText: 'Internal Server Error',
                body: {
                    status: 500,
                    message: 'hello world',
                },
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        let error;
        try {
            const { ErrorService } = require('./generated/v3/node/index.js');
            await ErrorService.testErrorCode(409);
        } catch (e) {
            const err = e as any;
            error = JSON.stringify({
                name: err.name,
                message: err.message,
                url: err.url,
                status: err.status,
                statusText: err.statusText,
                body: err.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message:
                    'Generic Error: status: 409; status text: Conflict; body: {\n  "status": 409,\n  "message": "hello world"\n}',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: {
                    status: 409,
                    message: 'hello world',
                },
            })
        );
    });

    it('it should parse query params', async () => {
        const { ParametersService } = require('./generated/v3/node/index.js');
        const result = (await ParametersService.postCallWithOptionalParam({
            page: 0,
            size: 1,
            sort: ['location'],
        })) as Promise<any>;
        expect((result as any).query).toStrictEqual({ page: '0', size: '1', sort: 'location' });
    });

    it('should serialize path parameters', async () => {
        const { ParametersService } = require('./generated/v3/node/index.js');
        const testPrimitive = 5;
        const testArray = [3, 4, 5];
        const testObject = {
            role: 'admin',
            firstName: 'Alex',
        };
        const primitives = ParametersService.getCallWithStyledPathParameters(
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive
        );

        const arrays = ParametersService.getCallWithStyledPathParameters(
            testArray,
            testArray,
            testArray,
            testArray,
            testArray,
            testArray,
            testArray
        );

        const objects = ParametersService.getCallWithStyledPathParameters(
            testObject,
            testObject,
            testObject,
            testObject,
            testObject,
            testObject,
            testObject
        );

        const results = await Promise.all([primitives, arrays, objects]);

        performPathParameterAssertions({
            primitives: results[0].path,
            arrays: results[1].path,
            objects: results[2].path,
        });
    });

    it('should serialize query parameters', async () => {
        const { ParametersService } = require('./generated/v3/node/index.js');
        const testPrimitive = 5;
        const testArray = [3, 4, 5];
        const testObject = {
            role: 'admin',
            firstName: 'Alex',
        };

        const primitives = ParametersService.getCallWithStyledQueryParameters(
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive,
            testPrimitive
        );

        const arrays = ParametersService.getCallWithStyledQueryParameters(
            testArray,
            testArray,
            testArray,
            testArray,
            testArray,
            testArray,
            testArray,
            testArray
        );

        /*
            For object serialization we need to perform an approach that lets us
            do our assertions easier. Instead of using all parameters of using all 8
            parameters of the function we use one at a time.

            If we would use all paramters at once (like above), assertions would become very
            difficult as some object serializations serialize object prooperties to their own
            query parameters.
        */
        const objectPromises: Promise<any>[] = [];
        for (let n = 0; n < 8; n++) {
            const params: any[] = new Array(8).fill(undefined);
            params[n] = testObject;

            objectPromises.push(ParametersService.getCallWithStyledQueryParameters(...params));
        }

        const results = await Promise.all([primitives, arrays, Promise.all(objectPromises)]);

        performQueryParameterAssertions({
            primitives: results[0].url,
            arrays: results[1].url,
            objects: results[2].map(r => r.url),
        });
    });

    it('should serialize header parameters', async () => {
        const { ParametersService } = require('./generated/v3/node/index.js');
        const testPrimitive = 5;
        const testArray = [3, 4, 5];
        const testObject = {
            role: 'admin',
            firstName: 'Alex',
        };

        const primitives = ParametersService.getCallWithStyledHeaderParameters(
            testPrimitive,
            testPrimitive,
            testPrimitive
        );

        const arrays = ParametersService.getCallWithStyledHeaderParameters(testArray, testArray, testArray);

        const objects = ParametersService.getCallWithStyledHeaderParameters(testObject, testObject, testObject);

        const results = await Promise.all([primitives, arrays, objects]);

        performHeaderParmeterAssertions({
            primitives: results[0].headers,
            arrays: results[1].headers,
            objects: results[2].headers,
        });
    });
});
