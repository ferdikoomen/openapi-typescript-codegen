import { readFileSync } from 'fs';
import handlebars from 'handlebars';

import { preCompileTemplate } from './preCompileTemplate';

jest.mock('fs');
jest.mock('handlebars');

describe('preCompileTemplate', () => {
    it('returns undefined if no file is provided', () => {
        expect(preCompileTemplate()).toBeUndefined();
    });

    it('reads the file, trims it, and precompiles it', () => {
        (readFileSync as jest.Mock).mockReturnValue({ toString: () => ' mock template ' });
        (handlebars.precompile as jest.Mock).mockReturnValue('"mock template spec"');

        const result = preCompileTemplate('mock-file.hbs');

        expect(readFileSync).toHaveBeenCalledWith('mock-file.hbs', 'utf8');
        expect(handlebars.precompile).toHaveBeenCalledWith('mock template', {
            strict: true,
            noEscape: true,
            preventIndent: true,
            knownHelpersOnly: true,
            knownHelpers: {
                ifdef: true,
                equals: true,
                notEquals: true,
                containsSpaces: true,
                union: true,
                intersection: true,
                enumerator: true,
                escapeComment: true,
                escapeDescription: true,
                camelCase: true,
            },
        });
        expect(result).toBe('mock template spec');
    });
});
