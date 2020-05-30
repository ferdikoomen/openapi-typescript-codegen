import * as Handlebars from 'handlebars/runtime';

import $OpenAPI from '../templates/core/OpenAPI.hbs';
import $exportModel from '../templates/exportModel.hbs';
import $exportSchema from '../templates/exportSchema.hbs';
import $exportService from '../templates/exportService.hbs';
import $index from '../templates/index.hbs';
import $exportEnum from '../templates/partials/exportEnum.hbs';
import $exportInterface from '../templates/partials/exportInterface.hbs';
import $exportType from '../templates/partials/exportType.hbs';
import $extends from '../templates/partials/extends.hbs';
import $isNullable from '../templates/partials/isNullable.hbs';
import $isReadOnly from '../templates/partials/isReadOnly.hbs';
import $isRequired from '../templates/partials/isRequired.hbs';
import $parameters from '../templates/partials/parameters.hbs';
import $result from '../templates/partials/result.hbs';
import $schema from '../templates/partials/schema.hbs';
import $schemaArray from '../templates/partials/schemaArray.hbs';
import $schemaDictionary from '../templates/partials/schemaDictionary.hbs';
import $schemaEnum from '../templates/partials/schemaEnum.hbs';
import $schemaGeneric from '../templates/partials/schemaGeneric.hbs';
import $schemaInterface from '../templates/partials/schemaInterface.hbs';
import $type from '../templates/partials/type.hbs';
import $typeArray from '../templates/partials/typeArray.hbs';
import $typeDictionary from '../templates/partials/typeDictionary.hbs';
import $typeEnum from '../templates/partials/typeEnum.hbs';
import $typeGeneric from '../templates/partials/typeGeneric.hbs';
import $typeInterface from '../templates/partials/typeInterface.hbs';
import $typeReference from '../templates/partials/typeReference.hbs';
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
export function registerHandlebarTemplates(): Templates {
    registerHandlebarHelpers();

    const templates: Templates = {
        index: Handlebars.template($index),
        model: Handlebars.template($exportModel),
        schema: Handlebars.template($exportSchema),
        service: Handlebars.template($exportService),
        settings: Handlebars.template($OpenAPI),
    };

    Handlebars.registerPartial('exportEnum', Handlebars.template($exportEnum));
    Handlebars.registerPartial('exportInterface', Handlebars.template($exportInterface));
    Handlebars.registerPartial('exportType', Handlebars.template($exportType));
    Handlebars.registerPartial('extends', Handlebars.template($extends));
    Handlebars.registerPartial('isNullable', Handlebars.template($isNullable));
    Handlebars.registerPartial('isReadOnly', Handlebars.template($isReadOnly));
    Handlebars.registerPartial('isRequired', Handlebars.template($isRequired));
    Handlebars.registerPartial('parameters', Handlebars.template($parameters));
    Handlebars.registerPartial('result', Handlebars.template($result));
    Handlebars.registerPartial('schema', Handlebars.template($schema));
    Handlebars.registerPartial('schemaArray', Handlebars.template($schemaArray));
    Handlebars.registerPartial('schemaDictionary', Handlebars.template($schemaDictionary));
    Handlebars.registerPartial('schemaEnum', Handlebars.template($schemaEnum));
    Handlebars.registerPartial('schemaGeneric', Handlebars.template($schemaGeneric));
    Handlebars.registerPartial('schemaInterface', Handlebars.template($schemaInterface));
    Handlebars.registerPartial('type', Handlebars.template($type));
    Handlebars.registerPartial('typeArray', Handlebars.template($typeArray));
    Handlebars.registerPartial('typeDictionary', Handlebars.template($typeDictionary));
    Handlebars.registerPartial('typeEnum', Handlebars.template($typeEnum));
    Handlebars.registerPartial('typeGeneric', Handlebars.template($typeGeneric));
    Handlebars.registerPartial('typeInterface', Handlebars.template($typeInterface));
    Handlebars.registerPartial('typeReference', Handlebars.template($typeReference));

    return templates;
}
