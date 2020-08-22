import { Service } from '../client/interfaces/Service';
import { sortServicesByName } from './sortServicesByName';

describe('sortServicesByName', () => {
    it('should return sorted list', () => {
        const john: Service = {
            name: 'John',
            operations: [],
            imports: [],
        };
        const jane: Service = {
            name: 'Jane',
            operations: [],
            imports: [],
        };
        const doe: Service = {
            name: 'Doe',
            operations: [],
            imports: [],
        };

        const services: Service[] = [john, jane, doe];

        expect(sortServicesByName([])).toEqual([]);
        expect(sortServicesByName(services)).toEqual([doe, jane, john]);
    });
});
