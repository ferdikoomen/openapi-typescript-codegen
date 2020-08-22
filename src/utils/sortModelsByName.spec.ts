import { Model } from '../client/interfaces/Model';
import { sortModelsByName } from './sortModelsByName';

describe('sortModelsByName', () => {
    it('should return sorted list', () => {
        const john: Model = {
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
        };
        const jane: Model = {
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
        };
        const doe: Model = {
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
        };
        const models: Model[] = [john, jane, doe];

        expect(sortModelsByName([])).toEqual([]);
        expect(sortModelsByName(models)).toEqual([doe, jane, john]);
    });
});
