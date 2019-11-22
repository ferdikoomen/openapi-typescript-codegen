import * as Handlebars from 'handlebars';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { Language } from '../index';
import * as path from 'path';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';
import * as glob from 'glob';

export interface Templates {
    index: Handlebars.TemplateDelegate;
    model: Handlebars.TemplateDelegate;
    service: Handlebars.TemplateDelegate;
    settings: Handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 * @param language The language we need to generate (Typescript or Javascript).
 */
export function readHandlebarsTemplates(language: Language): Templates {
    try {
        registerHandlebarHelpers();

        const templates: Templates = {
            index: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/index.hbs`)),
            model: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/model.hbs`)),
            service: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/service.hbs`)),
            settings: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/core/OpenAPI.hbs`)),
        };

        const partials = path.resolve(__dirname, `../../src/templates/${language}/partials`);
        const partialsFiles = glob.sync('*.hbs', { cwd: partials });
        partialsFiles.forEach(partial => {
            Handlebars.registerPartial(path.basename(partial, '.hbs'), readHandlebarsTemplate(path.resolve(partials, partial)));
        });

        return templates;
    } catch (e) {
        throw new Error(`Could not read Handlebar templates`);
    }
}
