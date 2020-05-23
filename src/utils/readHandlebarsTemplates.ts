import * as Handlebars from 'handlebars/runtime';
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
        index: readHandlebarsTemplate(resolveTemplate('index.js')),
        model: readHandlebarsTemplate(resolveTemplate('model.js')),
        schema: readHandlebarsTemplate(resolveTemplate('schema.js')),
        service: readHandlebarsTemplate(resolveTemplate('service.js')),
        settings: readHandlebarsTemplate(resolveTemplate('core/OpenAPI.js')),
    };

    const partials = [
        'exportEnum.js',
        'exportInterface.js',
        'exportType.js',
        'extends.js',
        'isNullable.js',
        'isReadOnly.js',
        'isRequired.js',
        'parameters.js',
        'result.js',
        'schema.js',
        'schemaArray.js',
        'schemaDictionary.js',
        'schemaEnum.js',
        'schemaGeneric.js',
        'schemaInterface.js',
        'type.js',
        'typeArray.js',
        'typeDictionary.js',
        'typeEnum.js',
        'typeGeneric.js',
        'typeInterface.js',
        'typeReference.js',
    ];

    partials.forEach(partial => {
        const templatePath = resolveTemplate(`partials/${partial}`);
        const templateName = path.basename(partial, '.js');
        const template = readHandlebarsTemplate(templatePath);
        Handlebars.registerPartial(templateName, template);
    });

    return templates;
}
