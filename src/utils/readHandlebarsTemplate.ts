import * as fs from 'fs';
import * as handlebars from 'handlebars';

/**
 * Read and compile the Handlebars template.
 * @param filePath
 */
export function readHandlebarsTemplate(filePath: string): handlebars.TemplateDelegate {
    if (fs.existsSync(filePath)) {
        const template: string = fs.readFileSync(filePath, 'utf8').toString();
        try {
            return handlebars.compile(template);
        } catch (e) {
            throw new Error(`Could not compile Handlebar template: "${filePath}"`);
        }
    }
    throw new Error(`Could not find Handlebar template: "${filePath}"`);
}
