import { getServiceNames } from './getServiceNames';
import { Service } from '../client/interfaces/Service';

describe('getServiceNames', () => {
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

        expect(getServiceNames(new Map<string, Service>())).toEqual([]);
        expect(getServiceNames(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
