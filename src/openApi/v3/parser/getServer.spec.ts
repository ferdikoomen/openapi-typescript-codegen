import { getServer } from './getServer';

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
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
});
