import { isPrimaryType } from './isPrimaryType';

describe('isPrimaryType', () => {
    it('should return true for primary types', () => {
        expect(isPrimaryType('number')).toBeTruthy();
        expect(isPrimaryType('boolean')).toBeTruthy();
        expect(isPrimaryType('string')).toBeTruthy();
        expect(isPrimaryType('any')).toBeTruthy();
        expect(isPrimaryType('void')).toBeTruthy();
        expect(isPrimaryType('null')).toBeTruthy();
        expect(isPrimaryType('Array')).toBeFalsy();
        expect(isPrimaryType('MyModel')).toBeFalsy();
    });
});
