import Handlebars from 'handlebars/runtime';

import { HttpClient } from '../HttpClient';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

describe('registerHandlebarHelpers', () => {
    beforeEach(() => {
        registerHandlebarHelpers({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });
    });

    it('should register the helpers', () => {
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('ifdef');
        expect(helpers).toContain('equals');
        expect(helpers).toContain('notEquals');
        expect(helpers).toContain('containsSpaces');
        expect(helpers).toContain('union');
        expect(helpers).toContain('intersection');
        expect(helpers).toContain('enumerator');
        expect(helpers).toContain('escapeComment');
        expect(helpers).toContain('escapeDescription');
        expect(helpers).toContain('camelCase');
    });

    it('should render single-value nested enums as enum members', () => {
        const result = Handlebars.helpers.enumerator(
            [{ name: 'CURATOR_LIST', value: "'curator_list'", type: 'string', description: null }],
            'PlayerGgFollowTarget',
            'kind',
            { fn: (value: string) => value }
        );

        expect(result).toBe('PlayerGgFollowTarget.kind.CURATOR_LIST');
    });

    it('should render multi-value nested enums as enum types', () => {
        const result = Handlebars.helpers.enumerator(
            [
                { name: 'GAME', value: "'game'", type: 'string', description: null },
                { name: 'CURATOR_LIST', value: "'curator_list'", type: 'string', description: null },
            ],
            'PlayerGgFollowTarget',
            'kind',
            { fn: (value: string) => value }
        );

        expect(result).toBe('PlayerGgFollowTarget.kind');
    });
});
