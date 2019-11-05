import { Schema } from '../client/interfaces/Schema';
import { getSortedSchemas } from './getSortedSchemas';

describe('getSortedSchemas', () => {
    it('should return sorted list', () => {
        const schemas = new Map<string, Schema>();
        schemas.set('John', {
            name: 'John',
            base: 'John',
            imports: [],
        });
        schemas.set('Jane', {
            name: 'Jane',
            base: 'Jane',
            imports: [],
        });
        schemas.set('Doe', {
            name: 'Doe',
            base: 'Doe',
            imports: [],
        });

        expect(getSortedSchemas(new Map<string, Schema>())).toEqual([]);
        expect(getSortedSchemas(schemas)).toEqual([schemas.get('Doe'), schemas.get('Jane'), schemas.get('John')]);
    });
});
