import * as Handlebars from 'handlebars';
import * as glob from 'glob';
import * as path from 'path';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

export interface Templates {
    index: Handlebars.TemplateDelegate;
    model: Handlebars.TemplateDelegate;
    schema: Handlebars.TemplateDelegate;
    service: Handlebars.TemplateDelegate;
    settings: Handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
export function readHandlebarsTemplates(): Templates {
    try {
        registerHandlebarHelpers();

        const templates: Templates = {
            index: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/index.hbs`)),
            model: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/model.hbs`)),
            schema: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/schema.hbs`)),
            service: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/service.hbs`)),
            settings: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/core/OpenAPI.hbs`)),
        };

        const partials = path.resolve(__dirname, `../../src/templates/partials`);
        const partialsFiles = glob.sync('*.hbs', { cwd: partials });
        partialsFiles.forEach(partial => {
            Handlebars.registerPartial(path.basename(partial, '.hbs'), readHandlebarsTemplate(path.resolve(partials, partial)));
        });

        return templates;
    } catch (e) {
        throw new Error(`Could not read Handlebar templates`);
    }
}
