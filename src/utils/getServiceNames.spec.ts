import type { Service } from '../client/interfaces/Service';

import { getServiceNames } from './getServiceNames';

describe('getServiceNames', () => {
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

        const services = [john, jane, doe];

        expect(getServiceNames([])).toEqual([]);
        expect(getServiceNames(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
