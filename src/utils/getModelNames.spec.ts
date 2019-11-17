import { getModelNames } from './getModelNames';
import { Model } from '../client/interfaces/Model';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const models = new Map<string, Model>();
        models.set('John', {
            name: 'John',
            type: 'John',
            base: 'John',
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            properties: [],
        });
        models.set('Jane', {
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            properties: [],
        });
        models.set('Doe', {
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            properties: [],
        });

        expect(getModelNames(new Map<string, Model>())).toEqual([]);
        expect(getModelNames(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
