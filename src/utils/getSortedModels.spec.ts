import { getSortedModels } from './getSortedModels';
import { Model } from '../client/interfaces/Model';

describe('getSortedModels', () => {
    it('should return sorted list', () => {
        const models = new Map<string, Model>();
        models.set('John', {
            name: 'John',
            type: 'John',
            base: 'John',
            template: null,
            description: null,
            validation: null,
            extends: [],
            imports: [],
            enum: [],
            properties: [],
        });
        models.set('Jane', {
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            template: null,
            description: null,
            validation: null,
            extends: [],
            imports: [],
            enum: [],
            properties: [],
        });
        models.set('Doe', {
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            template: null,
            description: null,
            validation: null,
            extends: [],
            imports: [],
            enum: [],
            properties: [],
        });

        expect(getSortedModels(new Map<string, Model>())).toEqual([]);
        expect(getSortedModels(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
