import { getType } from './getType';

describe('getType', () => {
    it('should convert int', () => {
        const type = getType('int', null);
        expect(type.type).toEqual('number');
        expect(type.base).toEqual('number');
        expect(type.template).toEqual(null);
        expect(Array.from(type.imports.values())).toEqual([]);
    });

    it('should convert string', () => {
        const type = getType('String', null);
        expect(type.type).toEqual('string');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(Array.from(type.imports.values())).toEqual([]);
    });

    it('should convert string array', () => {
        const type = getType('Array[String]', null);
        expect(type.type).toEqual('string[]');
        expect(type.base).toEqual('string');
        expect(type.template).toEqual(null);
        expect(Array.from(type.imports.values())).toEqual([]);
    });

    it('should convert template with primary', () => {
        const type = getType('#/definitions/Link[String]', null);
        expect(type.type).toEqual('Link<string>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('string');
        expect(Array.from(type.imports.values())).toEqual(['Link']);
    });

    it('should convert template with model', () => {
        const type = getType('#/definitions/Link[Model]', null);
        expect(type.type).toEqual('Link<Model>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Model');
        expect(Array.from(type.imports.values())).toEqual(['Link', 'Model']);
    });

    it('should have double imports', () => {
        const type = getType('#/definitions/Link[Link]', null);
        expect(type.type).toEqual('Link<Link>');
        expect(type.base).toEqual('Link');
        expect(type.template).toEqual('Link');
        expect(Array.from(type.imports.values())).toEqual(['Link', 'Link']);
    });

    it('should convert generic', () => {
        const type = getType('#/definitions/Link', 'Link');
        expect(type.type).toEqual('T');
        expect(type.base).toEqual('T');
        expect(type.template).toEqual(null);
        expect(Array.from(type.imports.values())).toEqual([]);
    });
});
