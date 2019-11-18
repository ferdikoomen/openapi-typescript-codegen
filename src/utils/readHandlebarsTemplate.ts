import * as fs from 'fs';
import * as handlebars from 'handlebars';

/**
 * Read and compile the Handlebars template.
 * @param filePath
 */
export function readHandlebarsTemplate(filePath: string): handlebars.TemplateDelegate {
    if (fs.existsSync(filePath)) {
        try {
            const template = fs
                .readFileSync(filePath, 'utf8')
                .toString()
                .trim();
            return handlebars.compile(template, {
                strict: true,
                knownHelpersOnly: true,
                knownHelpers: {
                    eq: true,
                },
            });
        } catch (e) {
            throw new Error(`Could not compile Handlebar template: "${filePath}"`);
        }
    }
    throw new Error(`Could not find Handlebar template: "${filePath}"`);
}
