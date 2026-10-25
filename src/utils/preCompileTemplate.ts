import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import { extname } from 'path';

/**
 * Precompiles a Handlebars template from a given file.
 *
 * @param {string | undefined} file - The path to the file containing the Handlebars template.
 * @returns {TemplateSpecification | undefined} - The precompiled template as a string, ready to be exported.
 */
export function preCompileTemplate(file?: string): TemplateSpecification | undefined {
    if (!file) return;

    const template = extname(file) === '.hbs' ? readFileSync(file, 'utf8').toString().trim() : file;
    const templateSpec = handlebars.precompile(template, {
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

    return eval(`(function(){return ${templateSpec} }());`);
}
