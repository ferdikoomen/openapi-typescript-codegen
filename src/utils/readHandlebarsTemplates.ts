import * as handlebars from 'handlebars';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { Language } from '../index';
import * as path from 'path';

export interface Templates {
    index: handlebars.TemplateDelegate;
    model: handlebars.TemplateDelegate;
    service: handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 * @param language The language we need to generate (Typescript or Javascript).
 */
export function readHandlebarsTemplates(language: Language): Templates {
    const pathTemplateIndex = path.resolve(__dirname, `../../src/templates/${language}/index.hbs`);
    const pathTemplateModel = path.resolve(__dirname, `../../src/templates/${language}/model.hbs`);
    const pathTemplateService = path.resolve(__dirname, `../../src/templates/${language}/service.hbs`);

    try {
        return {
            index: readHandlebarsTemplate(pathTemplateIndex),
            model: readHandlebarsTemplate(pathTemplateModel),
            service: readHandlebarsTemplate(pathTemplateService),
        };
    } catch (e) {
        throw e;
    }
}
