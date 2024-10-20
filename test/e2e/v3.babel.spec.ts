import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithBabel } from './scripts/compileWithBabel';
import { copyAsset } from './scripts/copyAsset';
import { generateClient } from './scripts/generateClient';
import {
    performHeaderParmeterAssertions,
    performPathParameterAssertions,
    performQueryParameterAssertions,
} from './scripts/parameterSerializerAssertions';
import server from './scripts/server';

describe('v3.babel', () => {
    beforeAll(async () => {
        cleanup('v3/babel');
        await generateClient('v3/babel', 'v3', 'fetch', true, true);
        copyAsset('index.html', 'v3/babel/index.html');
        copyAsset('main.ts', 'v3/babel/main.ts');
        compileWithBabel('v3/babel');
        await server.start('v3/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = (window as any).tokenRequest;
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
            return await ComplexService.complexTypes({
                parameterObject: {
                    first: {
                        second: {
                            third: 'Hello World!',
                        },
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });

    it('support form data', async () => {
        const result = await browser.evaluate(async () => {
            const { ParametersService } = (window as any).api;
            return await ParametersService.callWithParameters({
                parameterHeader: 'valueHeader',
                parameterQuery: 'valueQuery',
                parameterForm: 'valueForm',
                parameterCookie: 'valueCookie',
                parameterPath: 'valuePath',
                requestBody: {
                    prop: 'valueBody',
                },
            });
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            await browser.evaluate(async () => {
                const { SimpleService } = (window as any).api;
                const promise = SimpleService.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('Request aborted');
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode({
                    status: 500,
                });
            } catch (e) {
                const error = e as any;
                return JSON.stringify({
                    name: error.name,
                    message: error.message,
                    url: error.url,
                    status: error.status,
                    statusText: error.statusText,
                    body: error.body,
                });
            }
            return;
        });

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
        const error = await browser.evaluate(async () => {
            try {
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode({
                    status: 409,
                });
            } catch (e) {
                const error = e as any;
                return JSON.stringify({
                    name: error.name,
                    message: error.message,
                    url: error.url,
                    status: error.status,
                    statusText: error.statusText,
                    body: error.body,
                });
            }
            return;
        });
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
        const result = await browser.evaluate(async () => {
            const { ParametersService } = (window as any).api;
            return (await ParametersService.postCallWithOptionalParam({
                parameter: {
                    page: 0,
                    size: 1,
                    sort: ['location'],
                },
            })) as Promise<any>;
        });
        expect(result.query).toStrictEqual({ page: '0', size: '1', sort: 'location' });
    });

    it('should serialize path parameters', async () => {
        const result = await browser.evaluate(async () => {
            const testPrimitive = 5;
            const testArray = [3, 4, 5];
            const testObject = {
                role: 'admin',
                firstName: 'Alex',
            };
            const { ParametersService } = (window as any).api;
            const primitives = ParametersService.getCallWithStyledPathParameters({
                unstyled: testPrimitive,
                simple: testPrimitive,
                simpleExploded: testPrimitive,
                label: testPrimitive,
                labelExploded: testPrimitive,
                matrix: testPrimitive,
                matrixExploded: testPrimitive,
            });

            const arrays = ParametersService.getCallWithStyledPathParameters({
                unstyled: testArray,
                simple: testArray,
                simpleExploded: testArray,
                label: testArray,
                labelExploded: testArray,
                matrix: testArray,
                matrixExploded: testArray,
            });

            const objects = ParametersService.getCallWithStyledPathParameters({
                unstyled: testObject,
                simple: testObject,
                simpleExploded: testObject,
                label: testObject,
                labelExploded: testObject,
                matrix: testObject,
                matrixExploded: testObject,
            });

            const results = await Promise.all([primitives, arrays, objects]);

            return {
                primitives: results[0].path,
                arrays: results[1].path,
                objects: results[2].path,
            };
        });

        performPathParameterAssertions(result);
    });

    it('should serialize query parameters', async () => {
        const result = await browser.evaluate(async () => {
            const testPrimitive = 5;
            const testArray = [3, 4, 5];
            const testObject = {
                role: 'admin',
                firstName: 'Alex',
            };
            const { ParametersService } = (window as any).api;
            const primitives = ParametersService.getCallWithStyledQueryParameters({
                unstyled: testPrimitive,
                form: testPrimitive,
                formExploded: testPrimitive,
                spaceDelimited: testPrimitive,
                spaceDelimitedExploded: testPrimitive,
                pipeDelimited: testPrimitive,
                pipeDelimitedExploded: testPrimitive,
                deepObject: testPrimitive,
            });

            const arrays = ParametersService.getCallWithStyledQueryParameters({
                unstyled: testArray,
                form: testArray,
                formExploded: testArray,
                spaceDelimited: testArray,
                spaceDelimitedExploded: testArray,
                pipeDelimited: testArray,
                pipeDelimitedExploded: testArray,
                deepObject: testArray,
            });

            /*
                For object serialization we need to perform an approach that lets us
                do our assertions easier. Instead of using all parameters of using all 8
                parameters of the function we use one at a time.

                If we would use all paramters at once (like above), assertions would become very
                difficult as some object serializations serialize object prooperties to their own
                query parameters.
            */
            const keys = [
                'unstyled',
                'form',
                'formExploded',
                'spaceDelimited',
                'spaceDelimitedExploded',
                'pipeDelimited',
                'pipeDelimitedExploded',
                'deepObject',
            ];
            const objectPromises: Promise<any>[] = [];
            for (let n = 0; n < 8; n++) {
                const params: Record<string, any> = {};
                params[keys[n]] = testObject;

                objectPromises.push(ParametersService.getCallWithStyledQueryParameters(params));
            }

            const results = await Promise.all([primitives, arrays, Promise.all(objectPromises)]);

            return {
                primitives: results[0].url,
                arrays: results[1].url,
                objects: results[2].map(r => r.url),
            };
        });

        performQueryParameterAssertions(result);
    });

    it('should serialize header parameters', async () => {
        const result = await browser.evaluate(async () => {
            const testPrimitive = 5;
            const testArray = [3, 4, 5];
            const testObject = {
                role: 'admin',
                firstName: 'Alex',
            };

            const { ParametersService } = (window as any).api;
            const primitives = ParametersService.getCallWithStyledHeaderParameters({
                unstyled: testPrimitive,
                simple: testPrimitive,
                simpleExploded: testPrimitive,
            });

            const arrays = ParametersService.getCallWithStyledHeaderParameters({
                unstyled: testArray,
                simple: testArray,
                simpleExploded: testArray,
            });

            const objects = ParametersService.getCallWithStyledHeaderParameters({
                unstyled: testObject,
                simple: testObject,
                simpleExploded: testObject,
            });

            const results = await Promise.all([primitives, arrays, objects]);

            return {
                primitives: results[0].headers,
                arrays: results[1].headers,
                objects: results[2].headers,
            };
        });

        performHeaderParmeterAssertions(result);
    });
});
