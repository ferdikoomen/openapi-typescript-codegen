import { stripNamespace } from './stripNamespace';

describe('stripNamespace', () => {
    it('should strip namespace', () => {
        expect(stripNamespace('#/definitions/Item')).toEqual('Item');
        expect(stripNamespace('#/parameters/Item')).toEqual('Item');
        expect(stripNamespace('#/responses/Item')).toEqual('Item');
        expect(stripNamespace('#/securityDefinitions/Item')).toEqual('Item');
        expect(stripNamespace('Template[Model]')).toEqual('Template[Model]');
        expect(stripNamespace('namespace.Template[Model]')).toEqual('Template[Model]');
        expect(stripNamespace('namespace.Template[namespace.Model]')).toEqual('Template[Model]');
        expect(stripNamespace('Item')).toEqual('Item');
    });
});
