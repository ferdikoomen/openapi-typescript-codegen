import { getModelNames } from './getModelNames';
import { Model } from '../client/interfaces/Model';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const models = new Map<string, Model>();
        models.set('John', {
            export: 'interface',
            name: 'John',
            type: 'John',
            base: 'John',
            template: null,
            link: null,
            description: null,
            isProperty: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });
        models.set('Jane', {
            export: 'interface',
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            template: null,
            link: null,
            description: null,
            isProperty: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });
        models.set('Doe', {
            export: 'interface',
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            template: null,
            link: null,
            description: null,
            isProperty: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });

        expect(getModelNames(new Map<string, Model>())).toEqual(['Dictionary']);
        expect(getModelNames(models)).toEqual(['Dictionary', 'Doe', 'Jane', 'John']);
    });
});
