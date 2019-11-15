import { getSortedModels } from './getSortedModels';
import { Model } from '../client/interfaces/Model';

describe('getSortedModels', () => {
    it('should return sorted list', () => {
        const models: Model[] = [
            {
                isInterface: false,
                isType: false,
                isEnum: false,
                name: 'John',
                type: 'John',
                base: 'John',
                template: null,
                validation: null,
                description: null,
                extends: null,
                imports: [],
                properties: [],
                enums: [],
            },
            {
                isInterface: false,
                isType: false,
                isEnum: false,
                name: 'Jane',
                type: 'Jane',
                base: 'Jane',
                template: null,
                validation: null,
                description: null,
                extends: null,
                imports: [],
                properties: [],
                enums: [],
            },
            {
                isInterface: false,
                isType: false,
                isEnum: false,
                name: 'Doe',
                type: 'Doe',
                base: 'Doe',
                template: null,
                validation: null,
                description: null,
                extends: null,
                imports: [],
                properties: [],
                enums: [],
            },
        ];

        expect(getSortedModels([])).toEqual([]);
        expect(getSortedModels(models)).toEqual(models.reverse());
    });
});
