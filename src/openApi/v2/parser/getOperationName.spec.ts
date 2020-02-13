import { getOperationName } from './getOperationName';

describe('getOperationName', () => {
    it('should produce correct result', () => {
        expect(getOperationName('')).toEqual('');
        expect(getOperationName('FooBar')).toEqual('fooBar');
        expect(getOperationName('Foo Bar')).toEqual('fooBar');
        expect(getOperationName('foo bar')).toEqual('fooBar');
        expect(getOperationName('foo-bar')).toEqual('fooBar');
        expect(getOperationName('foo_bar')).toEqual('fooBar');
        expect(getOperationName('foo.bar')).toEqual('fooBar');
    });
});
