import { isString } from './isString';

describe('isString', () => {
    it('should produce correct result', () => {
        expect(isString('foo')).toBeTruthy();
        expect(isString('123')).toBeTruthy();
        expect(isString('-1')).toBeTruthy();
        expect(isString('')).toBeTruthy();
        expect(isString(null)).toBeFalsy();
        expect(isString(undefined)).toBeFalsy();
        expect(isString({})).toBeFalsy();
    });
});
