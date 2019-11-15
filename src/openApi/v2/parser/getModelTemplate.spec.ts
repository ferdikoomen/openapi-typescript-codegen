import { getModelTemplate } from './getModelTemplate';

describe('getModelTemplate', () => {
    it('should return generic for template type', () => {
        const template = getModelTemplate({
            type: 'Link<Model>',
            base: 'Link',
            template: 'Model',
            imports: ['Model'],
        });
        expect(template).toEqual('<T>');
    });

    it('should return empty for primary type', () => {
        const template = getModelTemplate({
            type: 'string',
            base: 'string',
            template: null,
            imports: [],
        });
        expect(template).toEqual('');
    });
});
