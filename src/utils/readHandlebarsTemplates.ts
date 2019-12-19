import * as Handlebars from 'handlebars';
import * as glob from 'glob';
import * as path from 'path';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

export interface Templates {
    models: Handlebars.TemplateDelegate;
    model: Handlebars.TemplateDelegate;
    schemas: Handlebars.TemplateDelegate;
    schema: Handlebars.TemplateDelegate;
    services: Handlebars.TemplateDelegate;
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
            models: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/models/index.hbs`)),
            model: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/models/model.hbs`)),
            schemas: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/schemas/index.hbs`)),
            schema: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/schemas/schema.hbs`)),
            services: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/services/index.hbs`)),
            service: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/services/service.hbs`)),
            settings: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/core/OpenAPI.hbs`)),
        };

        const partials = path.resolve(__dirname, `../../src/templates//partials`);
        const partialsFiles = glob.sync('*.hbs', { cwd: partials });
        partialsFiles.forEach(partial => {
            Handlebars.registerPartial(path.basename(partial, '.hbs'), readHandlebarsTemplate(path.resolve(partials, partial)));
        });

        return templates;
    } catch (e) {
        throw new Error(`Could not read Handlebar templates`);
    }
}
