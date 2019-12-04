import { Service } from '../client/interfaces/Service';
import { getServiceNames } from './getServiceNames';

describe('getServiceNames', () => {
    it('should return sorted list', () => {
        const services: Service[] = [];
        services.push({
            name: 'John',
            operations: [],
            imports: [],
        });
        services.push({
            name: 'Jane',
            operations: [],
            imports: [],
        });
        services.push({
            name: 'Doe',
            operations: [],
            imports: [],
        });

        expect(getServiceNames([])).toEqual([]);
        expect(getServiceNames(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
