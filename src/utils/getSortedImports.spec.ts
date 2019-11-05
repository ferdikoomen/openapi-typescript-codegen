import { getSortedImports } from './getSortedImports';

describe('getSortedImports', () => {
    it('should return sorted list', () => {
        const arr = ['a', 'b', 'c'];

        expect(getSortedImports([])).toEqual([]);
        expect(getSortedImports([...arr])).toEqual(arr);
        expect(getSortedImports([...arr].reverse())).toEqual(arr);
        expect(getSortedImports([' ', ...arr])).toEqual(arr);
        expect(getSortedImports([...arr, ' '])).toEqual(arr);
        expect(getSortedImports([...arr, ...arr])).toEqual(arr);
    });
});
