import { Model } from '../client/interfaces/Model';
import { getModelNames } from './getModelNames';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const models: Model[] = [];
        models.push({
            export: 'interface',
            name: 'John',
            type: 'John',
            base: 'John',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });
        models.push({
            export: 'interface',
            name: 'Jane',
            type: 'Jane',
            base: 'Jane',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });
        models.push({
            export: 'interface',
            name: 'Doe',
            type: 'Doe',
            base: 'Doe',
            template: null,
            link: null,
            description: null,
            isDefinition: true,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
        });

        expect(getModelNames([])).toEqual([]);
        expect(getModelNames(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
