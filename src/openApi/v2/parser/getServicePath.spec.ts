import { getServicePath } from './getServicePath';

describe('getServicePath', () => {
    it('should produce correct result', () => {
        expect(getServicePath('/api/v{api-version}/list/{id}/{type}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}/${type}');
        expect(getServicePath('/api/v{api-version}/list/{id}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}');
        expect(getServicePath('/api/v1/list/{id}')).toEqual('/api/v1/list/${id}');
        expect(getServicePath('/api/v1/list')).toEqual('/api/v1/list');
    });
});
