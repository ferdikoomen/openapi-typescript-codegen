import { getOperationPath } from './getOperationPath';

describe('getOperationPath', () => {
    it('should produce correct result', () => {
        expect(getOperationPath('/api/v{api-version}/list/{id}/{type}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}/${type}');
        expect(getOperationPath('/api/v{api-version}/list/{id}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}');
        expect(getOperationPath('/api/v1/list/{id}')).toEqual('/api/v1/list/${id}');
        expect(getOperationPath('/api/v1/list')).toEqual('/api/v1/list');
    });
});
