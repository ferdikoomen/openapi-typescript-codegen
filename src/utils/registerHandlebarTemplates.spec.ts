import { HttpClient } from '../HttpClient';
import { registerHandlebarTemplates } from './registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useUnionTypes: false,
        });
        expect(templates.index).toBeDefined();
        expect(templates.exports.pathnames).toBeDefined();
        expect(templates.exports.factories).toBeDefined();
        expect(templates.exports.server).toBeDefined();
        expect(templates.exports.model).toBeDefined();
        expect(templates.exports.schema).toBeDefined();
        expect(templates.exports.service).toBeDefined();
        expect(templates.core.settings).toBeDefined();
        expect(templates.core.apiError).toBeDefined();
        expect(templates.core.apiRequestOptions).toBeDefined();
        expect(templates.core.apiResult).toBeDefined();
    });
});
