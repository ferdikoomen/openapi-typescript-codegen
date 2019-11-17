import { getModelNames } from './getModelNames';
import { Model } from '../client/interfaces/Model';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const models = new Map<string, Model>();
        models.set('John', {
            name: 'John',
            type: 'John',
            base: 'John',
            template: null,
            link: null,
            description: null,
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
            validation: null,
        });
        models.set('Jane', {
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            template: null,
            link: null,
            description: null,
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
            validation: null,
        });
        models.set('Doe', {
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            template: null,
            link: null,
            description: null,
            readOnly: false,
            required: false,
            nullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
            validation: null,
        });

        expect(getModelNames(new Map<string, Model>())).toEqual([]);
        expect(getModelNames(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
