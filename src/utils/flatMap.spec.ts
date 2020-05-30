import { flatMap } from './flatMap';

describe('flatMap', () => {
    it('should produce correct result', () => {
        expect(flatMap([1, 2, 3], i => [i])).toEqual([1, 2, 3]);
        expect(flatMap([1, 2, 3], i => [i + 1])).toEqual([2, 3, 4]);
        expect(flatMap([1, 2, 3], () => [1])).toEqual([1, 1, 1]);
    });
});
