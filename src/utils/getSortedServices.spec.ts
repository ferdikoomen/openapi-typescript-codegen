import { getSortedServices } from './getSortedServices';
import { Service } from '../client/interfaces/Service';

describe('getSortedServices', () => {
    it('should return sorted list', () => {
        const services = new Map<string, Service>();
        services.set('John', {
            name: 'John',
            base: 'John',
            imports: [],
        });
        services.set('Jane', {
            name: 'Jane',
            base: 'Jane',
            imports: [],
        });
        services.set('Doe', {
            name: 'Doe',
            base: 'Doe',
            imports: [],
        });

        expect(getSortedServices(new Map<string, Service>())).toEqual([]);
        expect(getSortedServices(services)).toEqual([services.get('Doe'), services.get('Jane'), services.get('John')]);
    });
});
