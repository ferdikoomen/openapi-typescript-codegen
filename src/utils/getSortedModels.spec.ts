import { getSortedModels } from './getSortedModels';
import { Model } from '../client/interfaces/Model';

describe('getSortedModels', () => {
    it('should return sorted list', () => {
        const models = new Map<string, Model>();
        models.set('John', {
            name: 'John',
            base: 'John',
            type: '',
            template: '',
            extends: [],
            imports: [],
            properties: [],
            enums: [],
        });
        models.set('Jane', {
            name: 'Jane',
            base: 'Jane',
            type: '',
            template: '',
            extends: [],
            imports: [],
            properties: [],
            enums: [],
        });
        models.set('Doe', {
            name: 'Doe',
            base: 'Doe',
            type: '',
            template: '',
            extends: [],
            imports: [],
            properties: [],
            enums: [],
        });

        expect(getSortedModels(new Map<string, Model>())).toEqual([]);
        expect(getSortedModels(models)).toEqual([models.get('Doe'), models.get('Jane'), models.get('John')]);
    });
});
