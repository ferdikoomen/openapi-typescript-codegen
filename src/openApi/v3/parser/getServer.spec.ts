import { getOperationServer, getPathItemServer, getServer } from "./getServer";

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
                openapi: '3.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                paths: {},
                servers: [
                    {
                        url: 'https://localhost:8080/api',
                    },
                ],
            })
        ).toEqual('https://localhost:8080/api');
    });

    it('should produce correct result with variables', () => {
        expect(
            getServer({
                openapi: '3.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                paths: {},
                servers: [
                    {
                        url: '{scheme}://localhost:{port}/api',
                        variables: {
                            scheme: {
                                default: 'https',
                            },
                            port: {
                                default: '8080',
                            },
                        },
                    },
                ],
            })
        ).toEqual('https://localhost:8080/api');
    });

    it('should produce correct result with Path Item servers', () => {
        expect(
            getPathItemServer({
                servers: [
                    {
                        url: 'https://sub.localhost:8080/api',
                    },
                ],
            })
        ).toEqual('https://sub.localhost:8080/api');
    });

    it('should produce undefined with no Path Item servers', () => {
        expect(
            getPathItemServer({})
        ).toEqual(undefined);
    });

    it('should produce correct result with Operation servers', () => {
        expect(
            getOperationServer({
                servers: [
                    {
                        url: 'https://sub.localhost:8080/api',
                    },
                ],
                responses: {
                    default: {
                        description: 'dummy',
                    }
                },
            })
        ).toEqual('https://sub.localhost:8080/api');
    });

    it('should produce undefined with no Operation servers', () => {
        expect(
            getOperationServer({
                responses: {
                    default: {
                        description: 'dummy',
                    }
                },
            })
        ).toEqual(undefined);
    });
});
