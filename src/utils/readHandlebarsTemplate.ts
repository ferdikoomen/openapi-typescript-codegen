import * as fs from 'fs';
import * as Handlebars from 'handlebars';

/**
 * Read and compile the Handlebars template.
 * @param filePath
 */
export function readHandlebarsTemplate(filePath: string): Handlebars.TemplateDelegate {
    if (fs.existsSync(filePath)) {
        try {
            const template = fs
                .readFileSync(filePath, 'utf8')
                .toString()
                .trim();
            return Handlebars.compile(template, {
                strict: true,
                noEscape: true,
                preventIndent: true,
                knownHelpersOnly: true,
                knownHelpers: {
                    equals: true,
                    notEquals: true,
                },
            });
        } catch (e) {
            throw new Error(`Could not compile Handlebar template: "${filePath}"`);
        }
    }
    throw new Error(`Could not find Handlebar template: "${filePath}"`);
}
