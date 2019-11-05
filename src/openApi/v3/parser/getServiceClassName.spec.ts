import { getServiceClassName } from './getServiceClassName';

describe('getServiceClassName', () => {
    it('should produce correct result', () => {
        expect(getServiceClassName('')).toEqual('');
        expect(getServiceClassName('FooBar')).toEqual('FooBarService');
        expect(getServiceClassName('Foo Bar')).toEqual('FooBarService');
        expect(getServiceClassName('foo bar')).toEqual('FooBarService');
        expect(getServiceClassName('FooBarService')).toEqual('FooBarService');
        expect(getServiceClassName('Foo Bar Service')).toEqual('FooBarService');
        expect(getServiceClassName('foo bar service')).toEqual('FooBarService');
    });
});
