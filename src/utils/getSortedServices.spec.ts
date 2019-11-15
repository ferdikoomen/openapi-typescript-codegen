import { getSortedServices } from './getSortedServices';
import { Service } from '../client/interfaces/Service';

describe('getSortedServices', () => {
    it('should return sorted list', () => {
        const services: Service[] = [
            {
                name: 'John',
                operations: [],
                imports: [],
            },
            {
                name: 'Jane',
                operations: [],
                imports: [],
            },
            {
                name: 'Doe',
                operations: [],
                imports: [],
            },
        ];

        expect(getSortedServices([])).toEqual([]);
        expect(getSortedServices(services)).toEqual(services.reverse());
    });
});
