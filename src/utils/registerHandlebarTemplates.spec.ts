import { registerHandlebarTemplates } from './registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        const templates = registerHandlebarTemplates();
        expect(templates.index).toBeDefined();
        expect(templates.exports.model).toBeDefined();
        expect(templates.exports.schema).toBeDefined();
        expect(templates.exports.service).toBeDefined();
        expect(templates.core.settings).toBeDefined();
        expect(templates.core.apiError).toBeDefined();
        expect(templates.core.getFormData).toBeDefined();
        expect(templates.core.getQueryString).toBeDefined();
        expect(templates.core.isSuccess).toBeDefined();
        expect(templates.core.request).toBeDefined();
        expect(templates.core.requestOptions).toBeDefined();
        expect(templates.core.requestUsingFetch).toBeDefined();
        expect(templates.core.requestUsingXHR).toBeDefined();
        expect(templates.core.result).toBeDefined();
    });
});
