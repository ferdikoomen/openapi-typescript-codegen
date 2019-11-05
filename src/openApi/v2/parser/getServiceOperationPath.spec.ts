import { getServiceOperationPath } from './getServiceOperationPath';

describe('getServiceOperationPath', () => {
    it('should produce correct result', () => {
        expect(getServiceOperationPath('/api/v{api-version}/list/{id}/{type}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}/${type}');
        expect(getServiceOperationPath('/api/v{api-version}/list/{id}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}');
        expect(getServiceOperationPath('/api/v1/list/{id}')).toEqual('/api/v1/list/${id}');
        expect(getServiceOperationPath('/api/v1/list')).toEqual('/api/v1/list');
    });
});
