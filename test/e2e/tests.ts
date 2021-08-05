import browser from './scripts/browser';
import { copy } from './scripts/copy';
import server from './scripts/server';
import { generate } from './scripts/generate';
import { compileWithTypescript } from './scripts/compileWithTypescript';

const TIMEOUT = 20000;

function executeBrowserTestsWithStaticClient(
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios',
    useOptions: boolean,
    useUnionTypes: boolean,
    exportClient: boolean,
    compile: (dir: string) => void
) {
    beforeAll(async () => {
        await generate(dir, version, client, useOptions, useUnionTypes, exportClient);
        await copy(dir);
        await compile(dir);
        await server.start(dir);
        await browser.start();
    }, TIMEOUT);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    }, TIMEOUT);

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = (window as any).tokenRequest;
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

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
            return await ComplexService.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!',
                    },
                },
            });
        });
        expect(result).toBeDefined();
        expect(result.query.parameterObject).toBeTruthy();
    });

    it('formData', async () => {
        const result = await browser.evaluate(async () => {
            const { ParametersService } = (window as any).api;
            return await ParametersService.callWithParameters(
                'valueHeader',
                'valueQuery',
                'valueForm',
                'valueCookie',
                'valuePath',
                {
                    prop: 'valueBody',
                }
            );
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        try {
            await browser.evaluate(async () => {
                const { SimpleService } = (window as any).api;
                const promise = SimpleService.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e: any) {
            expect(e.message).toContain('The user aborted a request.');
        }
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode(500);
            } catch (e: any) {
                return JSON.stringify({
                    name: e.name,
                    message: e.message,
                    url: e.url,
                    status: e.status,
                    statusText: e.statusText,
                    body: e.body,
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
                body: 'Internal Server Error',
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { ErrorService } = (window as any).api;
                await ErrorService.testErrorCode(409);
            } catch (e: any) {
                return JSON.stringify({
                    name: e.name,
                    message: e.message,
                    url: e.url,
                    status: e.status,
                    statusText: e.statusText,
                    body: e.body,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Generic Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: 'Conflict',
            })
        );
    });
}

function executeBrowserTestsWithInstanceClient(
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios',
    useOptions: boolean,
    useUnionTypes: boolean,
    exportClient: boolean,
    compile: (dir: string) => void
) {
    beforeAll(async () => {
        await generate(dir, version, client, useOptions, useUnionTypes, exportClient);
        await copy(dir);
        await compile(dir);
        await server.start(dir);
        await browser.start();
    }, TIMEOUT);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    }, TIMEOUT);

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient({ TOKEN: (window as any).tokenRequest });
            return client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient({ TOKEN: undefined, USERNAME: 'username', PASSWORD: 'password' });
            return client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient();
            return client.complex.complexTypes({
                first: {
                    second: {
                        third: 'Hello World!',
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });

    it('formData', async () => {
        const result = await browser.evaluate(async () => {
            const { AppClient } = (window as any).api;
            const client = new AppClient();
            return client.parameters.callWithParameters(
                'valueHeader',
                'valueQuery',
                'valueForm',
                'valueCookie',
                'valuePath',
                {
                    prop: 'valueBody',
                }
            );
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        try {
            await browser.evaluate(async () => {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                const promise = client.simple.getCallWithoutParametersAndResponse();
                setTimeout(() => {
                    promise.cancel();
                }, 10);
                await promise;
            });
        } catch (e: any) {
            expect(e.message).toContain('The user aborted a request.');
        }
    });

    it('should throw known error (500)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                await client.error.testErrorCode(500);
            } catch (e: any) {
                return JSON.stringify({
                    name: e.name,
                    message: e.message,
                    url: e.url,
                    status: e.status,
                    statusText: e.statusText,
                    body: e.body,
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
                body: 'Internal Server Error',
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        const error = await browser.evaluate(async () => {
            try {
                const { AppClient } = (window as any).api;
                const client = new AppClient();
                await client.error.testErrorCode(409);
            } catch (e: any) {
                return JSON.stringify({
                    name: e.name,
                    message: e.message,
                    url: e.url,
                    status: e.status,
                    statusText: e.statusText,
                    body: e.body,
                });
            }
            return;
        });
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Generic Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: 'Conflict',
            })
        );
    });
}

function executeNodeTestsWithStaticClient(dir: string, version: string, client: 'fetch' | 'xhr' | 'node' | 'axios') {
    beforeAll(async () => {
        await generate(dir, version, client, false, false, false);
        await compileWithTypescript(dir);
        await server.start(dir);
    }, TIMEOUT);

    afterAll(async () => {
        await server.stop();
    }, TIMEOUT);

    function requireClient() {
        return require(`./generated/${dir}/index.js`);
    }

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = requireClient();
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { OpenAPI, SimpleService } = requireClient();
        OpenAPI.TOKEN = undefined;
        OpenAPI.USERNAME = 'username';
        OpenAPI.PASSWORD = 'password';
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('complexService', async () => {
        const { ComplexService } = requireClient();
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('formData', async () => {
        const { ParametersService } = requireClient();
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
        try {
            const { SimpleService } = requireClient();
            const promise = SimpleService.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e: any) {
            expect(e.message).toContain('The user aborted a request.');
        }
    });

    it('should throw known error (500)', async () => {
        let error;
        try {
            const { ErrorService } = requireClient();
            await ErrorService.testErrorCode(500);
        } catch (e: any) {
            error = JSON.stringify({
                name: e.name,
                message: e.message,
                url: e.url,
                status: e.status,
                statusText: e.statusText,
                body: e.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Custom message: Internal Server Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=500',
                status: 500,
                statusText: 'Internal Server Error',
                body: 'Internal Server Error',
            })
        );
    });

    it('should throw unknown error (409)', async () => {
        let error;
        try {
            const { ErrorService } = requireClient();
            await ErrorService.testErrorCode(409);
        } catch (e: any) {
            error = JSON.stringify({
                name: e.name,
                message: e.message,
                url: e.url,
                status: e.status,
                statusText: e.statusText,
                body: e.body,
            });
        }
        expect(error).toBe(
            JSON.stringify({
                name: 'ApiError',
                message: 'Generic Error',
                url: 'http://localhost:3000/base/api/v1.0/error?status=409',
                status: 409,
                statusText: 'Conflict',
                body: 'Conflict',
            })
        );
    });
}

function executeNodeTestsWithInstanceClient(dir: string, version: string, client: 'fetch' | 'xhr' | 'node' | 'axios') {
    beforeAll(async () => {
        await generate(dir, version, client, false, false, true);
        await compileWithTypescript(dir);
        await server.start(dir);
    }, TIMEOUT);

    afterAll(async () => {
        await server.stop();
    }, TIMEOUT);

    function requireClient() {
        return require(`./generated/${dir}/index.js`);
    }

    it('requests token', async () => {
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        const { AppClient } = requireClient();
        const client = new AppClient({ TOKEN: tokenRequest });
        const result = await client.simple.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const { AppClient } = requireClient();
        const client = new AppClient({ TOKEN: undefined, USERNAME: 'username', PASSWORD: 'password' });
        const result = await client.simple.getCallWithoutParametersAndResponse();
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('complexService', async () => {
        const { AppClient } = requireClient();
        const client = new AppClient();
        const result = await client.complex.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('formData', async () => {
        const { AppClient } = requireClient();
        const client = new AppClient();
        const result = await client.parameters.callWithParameters(
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
        try {
            const { AppClient } = requireClient();
            const client = new AppClient();
            const promise = client.simple.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e: any) {
            expect(e.message).toContain('The user aborted a request.');
        }
    });
}

function executeBrowserTestsWithStaticClientOptionsTrue(
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios',
    compile: (dir: string) => void
) {
    beforeAll(async () => {
        await generate(dir, version, client, true, false, false);
        await copy(dir);
        await compile(dir);
        await server.start(dir);
        await browser.start();
    }, TIMEOUT);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    }, TIMEOUT);

    it('complexService', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
            return await ComplexService.complexTypes({
                parameterObject: 'object',
                parameterReference: 'test',
            });
        });
        expect(result).toBeDefined();
        expect(result.query).toEqual({
            parameterObject: 'object',
            parameterReference: 'test',
        });
    });
}

export {
    executeBrowserTestsWithStaticClient,
    executeBrowserTestsWithInstanceClient,
    executeNodeTestsWithStaticClient,
    executeNodeTestsWithInstanceClient,
    executeBrowserTestsWithStaticClientOptionsTrue,
};
