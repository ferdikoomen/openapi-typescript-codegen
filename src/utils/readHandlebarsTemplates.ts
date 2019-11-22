import * as Handlebars from 'handlebars';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { Language } from '../index';
import * as path from 'path';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

export interface Templates {
    index: Handlebars.TemplateDelegate;
    model: Handlebars.TemplateDelegate;
    service: Handlebars.TemplateDelegate;
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
        };

        Handlebars.registerPartial({
            exportGeneric: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportGeneric.hbs`)),
            exportReference: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportReference.hbs`)),
            exportInterface: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportInterface.hbs`)),
            exportEnum: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportEnum.hbs`)),
            exportDictionary: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportDictionary.hbs`)),
            exportArray: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/exportArray.hbs`)),
            validation: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validation.hbs`)),
            validationForGeneric: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForGeneric.hbs`)),
            validationForReference: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForReference.hbs`)),
            validationForEnum: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForEnum.hbs`)),
            validationForInterface: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForInterface.hbs`)),
            validationForDictionary: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForDictionary.hbs`)),
            validationForArray: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/validationForArray.hbs`)),
            type: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/type.hbs`)),
            typeForArray: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForArray.hbs`)),
            typeForDictionary: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForDictionary.hbs`)),
            typeForEnum: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForEnum.hbs`)),
            typeForInterface: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForInterface.hbs`)),
            typeForReference: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForReference.hbs`)),
            typeForGeneric: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/typeForGeneric.hbs`)),
        });

        return templates;
    } catch (e) {
        throw e;
    }
}
