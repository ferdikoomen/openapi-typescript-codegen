import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithBabel } from './scripts/compileWithBabel';
import { copyAsset } from './scripts/copyAsset';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('client.babel', () => {
    beforeAll(async () => {
        cleanup('client/babel');
        await generateClient('client/babel', 'v3', 'fetch', true, true, 'ApiClient');
        copyAsset('index.html', 'client/babel/index.html');
        copyAsset('main.ts', 'client/babel/main.ts');
        compileWithBabel('client/babel');
        await server.start('client/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { ApiClient } = (window as any).api;
            const client = new ApiClient({
                TOKEN: (window as any).tokenRequest,
                USERNAME: undefined,
                PASSWORD: undefined,
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { ApiClient } = (window as any).api;
            const client = new ApiClient({
                TOKEN: undefined,
                USERNAME: 'username',
                PASSWORD: 'password',
            });
            return await client.simple.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { ApiClient } = (window as any).api;
            const client = new ApiClient();
            return await client.complex.complexTypes({
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
            const { ApiClient } = (window as any).api;
            const client = new ApiClient();
            return await client.parameters.callWithParameters({
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
                const { ApiClient } = (window as any).api;
                const client = new ApiClient();
                const promise = client.simple.getCallWithoutParametersAndResponse();
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
                const { ApiClient } = (window as any).api;
                const client = new ApiClient();
                await client.error.testErrorCode({
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
                const { ApiClient } = (window as any).api;
                const client = new ApiClient();
                await client.error.testErrorCode({
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
});
