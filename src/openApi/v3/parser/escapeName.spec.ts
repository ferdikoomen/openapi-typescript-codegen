import { escapeName } from './escapeName';

describe('escapeName', () => {
    it('should escape', () => {
        expect(escapeName('')).toEqual('');
    });
});
