import Handlebars from 'handlebars/runtime';

import { HttpClient } from '../HttpClient';
import * as preCompiler from './preCompileTemplate';
import { registerHandlebarTemplates } from './registerHandlebarTemplates';

jest.mock('handlebars/runtime', () => ({
    template: jest.fn((file: string) => file),
    registerPartial: jest.fn((file: string) => file),
    registerHelper: jest.fn((file: string) => file),
}));

jest.mock('./preCompileTemplate', () => ({
    preCompileTemplate: jest.fn((file: string) => file),
}));

describe('registerHandlebarTemplates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register handlebar templates', () => {
        registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });

        expect(Handlebars.template).toHaveBeenCalled();
        expect(Handlebars.registerPartial).toHaveBeenCalled();
        expect(preCompiler.preCompileTemplate).toHaveBeenCalled();
    });

    it('should return default templates', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });

        expect(templates.index).toHaveProperty('compiler');
        expect(templates.exports.model).toHaveProperty('compiler');
        expect(templates.exports.schema).toHaveProperty('compiler');
        expect(templates.exports.service).toHaveProperty('compiler');
        expect(templates.core.settings).toHaveProperty('compiler');
        expect(templates.core.apiError).toHaveProperty('compiler');
        expect(templates.core.apiRequestOptions).toHaveProperty('compiler');
        expect(templates.core.apiResult).toHaveProperty('compiler');
        expect(templates.core.request).toHaveProperty('compiler');
    });

    it('should allow template overrides', () => {
        const templates = registerHandlebarTemplates({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
            templateOverrides: {
                index: 'override',
                exportService: 'override',
                settings: 'override',
            },
        });

        expect(templates.index).toBe('override');
        expect(templates.exports.model).toHaveProperty('compiler');
        expect(templates.exports.schema).toHaveProperty('compiler');
        expect(templates.exports.service).toBe('override');
        expect(templates.core.settings).toBe('override');
        expect(templates.core.apiError).toHaveProperty('compiler');
        expect(templates.core.apiRequestOptions).toHaveProperty('compiler');
        expect(templates.core.apiResult).toHaveProperty('compiler');
        expect(templates.core.request).toHaveProperty('compiler');
    });
});
