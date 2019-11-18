import * as handlebars from 'handlebars';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { Language } from '../index';
import * as path from 'path';

export interface Templates {
    index: handlebars.TemplateDelegate;
    model: handlebars.TemplateDelegate;
    service: handlebars.TemplateDelegate;
    exportGeneric: handlebars.TemplateDelegate;
    exportReference: handlebars.TemplateDelegate;
    exportInterface: handlebars.TemplateDelegate;
    exportEnum: handlebars.TemplateDelegate;
    exportDictionary: handlebars.TemplateDelegate;
    exportArray: handlebars.TemplateDelegate;
    validation: handlebars.TemplateDelegate;
    validationForGeneric: handlebars.TemplateDelegate;
    validationForReference: handlebars.TemplateDelegate;
    validationForEnum: handlebars.TemplateDelegate;
    validationForInterface: handlebars.TemplateDelegate;
    validationForDictionary: handlebars.TemplateDelegate;
    validationForArray: handlebars.TemplateDelegate;
    type: handlebars.TemplateDelegate;
    typeForArray: handlebars.TemplateDelegate;
    typeForDictionary: handlebars.TemplateDelegate;
    typeForEnum: handlebars.TemplateDelegate;
    typeForInterface: handlebars.TemplateDelegate;
    typeForReference: handlebars.TemplateDelegate;
    typeForGeneric: handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 * @param language The language we need to generate (Typescript or Javascript).
 */
export function readHandlebarsTemplates(language: Language): Templates {
    handlebars.registerHelper('eq', function(a: string, b: string, options: handlebars.HelperOptions): string {
        // eslint-disable
        // prettier-ignore
        // @ts-ignore
        return a === b ? options.fn(this) : options.inverse(this);
    });

    try {
        return {
            index: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/index.hbs`)),
            model: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/model.hbs`)),
            service: readHandlebarsTemplate(path.resolve(__dirname, `../../src/templates/${language}/service.hbs`)),
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
        };
    } catch (e) {
        throw e;
    }
}
