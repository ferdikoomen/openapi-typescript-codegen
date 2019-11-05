import { getServiceOperationName } from './getServiceOperationName';

describe('getServiceOperationName', () => {
    it('should produce correct result', () => {
        expect(getServiceOperationName('')).toEqual('');
        expect(getServiceOperationName('FooBar')).toEqual('fooBar');
        expect(getServiceOperationName('Foo Bar')).toEqual('fooBar');
        expect(getServiceOperationName('foo bar')).toEqual('fooBar');
    });
});
