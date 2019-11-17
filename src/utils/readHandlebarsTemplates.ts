import * as handlebars from 'handlebars';
import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { Language } from '../index';
import * as path from 'path';

export interface Templates {
    index: handlebars.TemplateDelegate;
    model: handlebars.TemplateDelegate;
    exportInterface: handlebars.TemplateDelegate;
    exportEnum: handlebars.TemplateDelegate;
    exportType: handlebars.TemplateDelegate;
    service: handlebars.TemplateDelegate;
    validation: handlebars.TemplateDelegate;
    type: handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 * @param language The language we need to generate (Typescript or Javascript).
 */
export function readHandlebarsTemplates(language: Language): Templates {
    const pathTemplateIndex = path.resolve(__dirname, `../../src/templates/${language}/index.hbs`);
    const pathTemplateModel = path.resolve(__dirname, `../../src/templates/${language}/model.hbs`);
    const pathTemplateExportInterface = path.resolve(__dirname, `../../src/templates/${language}/exportInterface.hbs`);
    const pathTemplateExportEnum = path.resolve(__dirname, `../../src/templates/${language}/exportEnum.hbs`);
    const pathTemplateExportType = path.resolve(__dirname, `../../src/templates/${language}/exportType.hbs`);
    const pathTemplateService = path.resolve(__dirname, `../../src/templates/${language}/service.hbs`);
    const pathTemplateValidation = path.resolve(__dirname, `../../src/templates/${language}/validation.hbs`);
    const pathTemplateType = path.resolve(__dirname, `../../src/templates/${language}/type.hbs`);

    try {
        return {
            index: readHandlebarsTemplate(pathTemplateIndex),
            model: readHandlebarsTemplate(pathTemplateModel),
            exportInterface: readHandlebarsTemplate(pathTemplateExportInterface),
            exportEnum: readHandlebarsTemplate(pathTemplateExportEnum),
            exportType: readHandlebarsTemplate(pathTemplateExportType),
            service: readHandlebarsTemplate(pathTemplateService),
            validation: readHandlebarsTemplate(pathTemplateValidation),
            type: readHandlebarsTemplate(pathTemplateType),
        };
    } catch (e) {
        throw e;
    }
}
