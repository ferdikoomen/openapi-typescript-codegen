import { getOpenApiVersion } from './getOpenApiVersion';

describe('getOpenApiVersion', () => {
    it('should read the correct version', () => {
        expect(getOpenApiVersion({ openapi: '2' })).toEqual(2);
        expect(getOpenApiVersion({ openapi: '3' })).toEqual(3);
        expect(getOpenApiVersion({ openapi: '2.0' })).toEqual(2);
        expect(getOpenApiVersion({ openapi: '3.0' })).toEqual(3);

        expect(getOpenApiVersion({ swagger: '2' })).toEqual(2);
        expect(getOpenApiVersion({ swagger: '3' })).toEqual(3);
        expect(getOpenApiVersion({ swagger: '2.0' })).toEqual(2);
        expect(getOpenApiVersion({ swagger: '3.0' })).toEqual(3);
    });
});
