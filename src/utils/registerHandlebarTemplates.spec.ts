import { registerHandlebarTemplates } from './registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        const templates = registerHandlebarTemplates({
            useUnionTypes: false,
        });
        expect(templates.index).toBeDefined();
        expect(templates.exports.pathnames).toBeDefined();
        expect(templates.exports.factories).toBeDefined();
        expect(templates.exports.client).toBeDefined();
        expect(templates.exports.hook).toBeDefined();
        expect(templates.exports.server).toBeDefined();
        expect(templates.exports.model).toBeDefined();
        expect(templates.exports.schema).toBeDefined();
    });
});
