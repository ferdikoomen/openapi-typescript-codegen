import * as Handlebars from 'handlebars/runtime';

/**
 * Read and compile the Handlebars template.
 * @param filePath
 */
export function readHandlebarsTemplate(filePath: string): Handlebars.TemplateDelegate {
    const template = require(filePath);

    return Handlebars.template(template);
}
