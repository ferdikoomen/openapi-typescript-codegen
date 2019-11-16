import { getSortedServices } from './getSortedServices';
import { Service } from '../client/interfaces/Service';

describe('getSortedServices', () => {
    it('should return sorted list', () => {
        const services = new Map<string, Service>();
        services.set('John', {
            name: 'John',
            operations: [],
            imports: [],
        });
        services.set('Jane', {
            name: 'Jane',
            operations: [],
            imports: [],
        });
        services.set('Doe', {
            name: 'Doe',
            operations: [],
            imports: [],
        });

        expect(getSortedServices(new Map<string, Service>())).toEqual([]);
        expect(getSortedServices(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
