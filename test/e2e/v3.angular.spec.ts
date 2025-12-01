import browser from './scripts/browser';
import { buildAngularProject } from './scripts/buildAngularProject';
import { cleanup } from './scripts/cleanup';
import { copyAsset } from './scripts/copyAsset';
import { createAngularProject } from './scripts/createAngularProject';
import { generateClient } from './scripts/generateClient';
import {
    performHeaderParmeterAssertions,
    performPathParameterAssertions,
    performQueryParameterAssertions,
} from './scripts/parameterSerializerAssertions';
import server from './scripts/server';

describe('v3.angular', () => {
    beforeAll(async () => {
        cleanup('v3/angular');
        createAngularProject('v3/angular', 'app');
        await generateClient('v3/angular/app/src', 'v3', 'angular');
        copyAsset('main-angular.ts', 'v3/angular/app/src/main.ts');
        buildAngularProject('v3/angular', 'app', 'dist');
        await server.start('v3/angular/app/dist/browser');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { OpenAPI, SimpleService } = (window as any).api;
                OpenAPI.TOKEN = (window as any).tokenRequest;
                OpenAPI.USERNAME = undefined;
                OpenAPI.PASSWORD = undefined;
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { OpenAPI, SimpleService } = (window as any).api;
                OpenAPI.TOKEN = undefined;
                OpenAPI.USERNAME = 'username';
                OpenAPI.PASSWORD = 'password';
                SimpleService.getCallWithoutParametersAndResponse().subscribe(resolve);
            });
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ComplexService } = (window as any).api;
                ComplexService.complexTypes({
                    first: {
                        second: {
                            third: 'Hello World!',
                        },
                    },
                }).subscribe(resolve);
            });
        });
        expect(result).toBeDefined();
    });

    it('support form data', async () => {
        const result = await browser.evaluate(async () => {
            return await new Promise<any>(resolve => {
                const { ParametersService } = (window as any).api;
                ParametersService.callWithParameters(
                    'valueHeader',
                    'valueQuery',
                    'valueForm',
                    'valueCookie',
                    'valuePath',
                    {
                        prop: 'valueBody',
                    }
                ).subscribe(resolve);
            });
        });
        expect(result).toBeDefined();
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                await new Promise<any>((resolve, reject) => {
                    const { ErrorService } = (window as any).api;
                    ErrorService.testErrorCode(500).subscribe(resolve, reject);
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
            const { ErrorService } = (window as any).api;
            ErrorService.testErrorCode(409).subscribe(console.log, console.log);
            try {
                await new Promise<any>((resolve, reject) => {
                    // const { ErrorService } = (window as any).api;
                    ErrorService.testErrorCode(409).subscribe(resolve, reject);
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

    it('should serialize path parameters', async () => {
        const result = await browser.evaluate(async () => {
            const testPrimitive = 5;
            const testArray = [3, 4, 5];
            const testObject = {
                role: 'admin',
                firstName: 'Alex',
            };
            const { ParametersService } = (window as any).api;
            const primitives = new Promise<any>(res =>
                ParametersService.getCallWithStyledPathParameters(
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive
                ).subscribe(res)
            );

            const arrays = new Promise<any>(res =>
                ParametersService.getCallWithStyledPathParameters(
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray
                ).subscribe(res)
            );

            const objects = new Promise<any>(res =>
                ParametersService.getCallWithStyledPathParameters(
                    testObject,
                    testObject,
                    testObject,
                    testObject,
                    testObject,
                    testObject,
                    testObject
                ).subscribe(res)
            );

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
            const primitives = new Promise<any>(res =>
                ParametersService.getCallWithStyledQueryParameters(
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive,
                    testPrimitive
                ).subscribe(res)
            );

            const arrays = new Promise<any>(res =>
                ParametersService.getCallWithStyledQueryParameters(
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray,
                    testArray
                ).subscribe(res)
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

                objectPromises.push(
                    new Promise(res => ParametersService.getCallWithStyledQueryParameters(...params).subscribe(res))
                );
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
            const primitives = new Promise<any>(res =>
                ParametersService.getCallWithStyledHeaderParameters(
                    testPrimitive,
                    testPrimitive,
                    testPrimitive
                ).subscribe(res)
            );

            const arrays = new Promise<any>(res =>
                ParametersService.getCallWithStyledHeaderParameters(testArray, testArray, testArray).subscribe(res)
            );

            const objects = new Promise<any>(res =>
                ParametersService.getCallWithStyledHeaderParameters(testObject, testObject, testObject).subscribe(res)
            );

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
