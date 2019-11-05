import { getServer } from './getServer';

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
                host: 'localhost:8080',
                basePath: '/api',
                schemes: ['http', 'https'],
            })
        ).toEqual('http://localhost:8080/api');
    });
});
