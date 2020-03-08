import * as Handlebars from 'handlebars';
import * as path from 'path';

import { readHandlebarsTemplate } from './readHandlebarsTemplate';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

function resolveTemplate(filePath: string): string {
    return path.resolve(__dirname, `../../src/templates/${filePath}`);
}

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
    registerHandlebarHelpers();

    const templates: Templates = {
        index: readHandlebarsTemplate(resolveTemplate('index.hbs')),
        model: readHandlebarsTemplate(resolveTemplate('model.hbs')),
        schema: readHandlebarsTemplate(resolveTemplate('schema.hbs')),
        service: readHandlebarsTemplate(resolveTemplate('service.hbs')),
        settings: readHandlebarsTemplate(resolveTemplate('core/OpenAPI.hbs')),
    };

    const partials = [
        'exportEnum.hbs',
        'exportInterface.hbs',
        'exportType.hbs',
        'extends.hbs',
        'isNullable.hbs',
        'isReadOnly.hbs',
        'isRequired.hbs',
        'parameters.hbs',
        'result.hbs',
        'schema.hbs',
        'schemaArray.hbs',
        'schemaDictionary.hbs',
        'schemaEnum.hbs',
        'schemaGeneric.hbs',
        'schemaInterface.hbs',
        'type.hbs',
        'typeArray.hbs',
        'typeDictionary.hbs',
        'typeEnum.hbs',
        'typeGeneric.hbs',
        'typeInterface.hbs',
        'typeReference.hbs',
    ];

    partials.forEach(partial => {
        const templatePath = resolveTemplate(`partials/${partial}`);
        const templateName = path.basename(partial, '.hbs');
        const template = readHandlebarsTemplate(templatePath);
        Handlebars.registerPartial(templateName, template);
    });

    return templates;
}
