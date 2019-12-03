import { getType } from './getType';

describe('getType', () => {
    it('should convert int', () => {
        const type = getType('int');
        expect(type.type).toEqual('number');
        expect(type.base).toEqual('number');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert string', () => {
        const type = getType('String');
        expect(type.type).toEqual('string');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert string array', () => {
        const type = getType('Array[String]');
        expect(type.type).toEqual('string[]');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });

    it('should convert template with primary', () => {
        const type = getType('#/components/schemas/Link[String]');
        expect(type.type).toEqual('Link<string>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('string');
        expect(type.imports).toEqual(['Link']);
    });

    it('should convert template with model', () => {
        const type = getType('#/components/schemas/Link[Model]');
        expect(type.type).toEqual('Link<Model>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Model');
        expect(type.imports).toEqual(['Link', 'Model']);
    });

    it('should have double imports', () => {
        const type = getType('#/components/schemas/Link[Link]');
        expect(type.type).toEqual('Link<Link>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Link');
        expect(type.imports).toEqual(['Link', 'Link']);
    });

    it('should convert generic', () => {
        const type = getType('#/components/schemas/Link', 'Link');
        expect(type.type).toEqual('T');
        expect(type.base).toEqual('T');
        expect(type.template).toEqual(null);
        expect(type.imports).toEqual([]);
    });
});
