import * as Handlebars from 'handlebars/runtime';

import templateCoreCatchGenericError from '../templates/core/catchGenericError.hbs';
import templateCoreGetFormData from '../templates/core/functions/getFormData.hbs';
import templateCoreGetQueryString from '../templates/core/functions/getQueryString.hbs';
import templateCoreGetUrl from '../templates/core/functions/getUrl.hbs';
import templateCoreIsSuccess from '../templates/core/functions/isSuccess.hbs';
import templateCoreSettings from '../templates/core/OpenAPI.hbs';
import templateCoreRequest from '../templates/core/request.hbs';
import templateCoreRequestOptions from '../templates/core/RequestOptions.hbs';
import templateCoreRequestUsingFetch from '../templates/core/functions/requestUsingFetch.hbs';
import templateCoreRequestUsingNode from '../templates/core/functions/requestUsingNode.hbs';
import templateCoreRequestUsingXHR from '../templates/core/functions/requestUsingXHR.hbs';
import templateCoreResponse from '../templates/core/Response.hbs';
import templateCoreResponseError from '../templates/core/ResponseError.hbs';
import templateExportModel from '../templates/exportModel.hbs';
import templateExportSchema from '../templates/exportSchema.hbs';
import templateExportService from '../templates/exportService.hbs';
import templateIndex from '../templates/index.hbs';
import partialExportEnum from '../templates/partials/exportEnum.hbs';
import partialExportInterface from '../templates/partials/exportInterface.hbs';
import partialExportType from '../templates/partials/exportType.hbs';
import partialExtends from '../templates/partials/extends.hbs';
import partialIsNullable from '../templates/partials/isNullable.hbs';
import partialIsReadOnly from '../templates/partials/isReadOnly.hbs';
import partialIsRequired from '../templates/partials/isRequired.hbs';
import partialParameters from '../templates/partials/parameters.hbs';
import partialResult from '../templates/partials/result.hbs';
import partialSchema from '../templates/partials/schema.hbs';
import partialSchemaArray from '../templates/partials/schemaArray.hbs';
import partialSchemaDictionary from '../templates/partials/schemaDictionary.hbs';
import partialSchemaEnum from '../templates/partials/schemaEnum.hbs';
import partialSchemaGeneric from '../templates/partials/schemaGeneric.hbs';
import partialSchemaInterface from '../templates/partials/schemaInterface.hbs';
import partialType from '../templates/partials/type.hbs';
import partialTypeArray from '../templates/partials/typeArray.hbs';
import partialTypeDictionary from '../templates/partials/typeDictionary.hbs';
import partialTypeEnum from '../templates/partials/typeEnum.hbs';
import partialTypeGeneric from '../templates/partials/typeGeneric.hbs';
import partialTypeInterface from '../templates/partials/typeInterface.hbs';
import partialTypeReference from '../templates/partials/typeReference.hbs';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

export interface Templates {
    index: Handlebars.TemplateDelegate;
    exports: {
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
    };
    core: {
        settings: Handlebars.TemplateDelegate;
        getFormData: Handlebars.TemplateDelegate;
        getQueryString: Handlebars.TemplateDelegate;
        getUrl: Handlebars.TemplateDelegate;
        isSuccess: Handlebars.TemplateDelegate;
        catchGenericError: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        requestOptions: Handlebars.TemplateDelegate;
        requestUsingFetch: Handlebars.TemplateDelegate;
        requestUsingXHR: Handlebars.TemplateDelegate;
        requestUsingNode: Handlebars.TemplateDelegate;
        response: Handlebars.TemplateDelegate;
        responseError: Handlebars.TemplateDelegate;
    };
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
export function registerHandlebarTemplates(): Templates {
    registerHandlebarHelpers();

    const templates: Templates = {
        index: Handlebars.template(templateIndex),
        exports: {
            model: Handlebars.template(templateExportModel),
            schema: Handlebars.template(templateExportSchema),
            service: Handlebars.template(templateExportService),
        },
        core: {
            settings: Handlebars.template(templateCoreSettings),
            getFormData: Handlebars.template(templateCoreGetFormData),
            getQueryString: Handlebars.template(templateCoreGetQueryString),
            getUrl: Handlebars.template(templateCoreGetUrl),
            isSuccess: Handlebars.template(templateCoreIsSuccess),
            catchGenericError: Handlebars.template(templateCoreCatchGenericError),
            request: Handlebars.template(templateCoreRequest),
            requestOptions: Handlebars.template(templateCoreRequestOptions),
            requestUsingFetch: Handlebars.template(templateCoreRequestUsingFetch),
            requestUsingXHR: Handlebars.template(templateCoreRequestUsingXHR),
            requestUsingNode: Handlebars.template(templateCoreRequestUsingNode),
            response: Handlebars.template(templateCoreResponse),
            responseError: Handlebars.template(templateCoreResponseError),
        },
    };

    Handlebars.registerPartial('exportEnum', Handlebars.template(partialExportEnum));
    Handlebars.registerPartial('exportInterface', Handlebars.template(partialExportInterface));
    Handlebars.registerPartial('exportType', Handlebars.template(partialExportType));
    Handlebars.registerPartial('extends', Handlebars.template(partialExtends));
    Handlebars.registerPartial('isNullable', Handlebars.template(partialIsNullable));
    Handlebars.registerPartial('isReadOnly', Handlebars.template(partialIsReadOnly));
    Handlebars.registerPartial('isRequired', Handlebars.template(partialIsRequired));
    Handlebars.registerPartial('parameters', Handlebars.template(partialParameters));
    Handlebars.registerPartial('result', Handlebars.template(partialResult));
    Handlebars.registerPartial('schema', Handlebars.template(partialSchema));
    Handlebars.registerPartial('schemaArray', Handlebars.template(partialSchemaArray));
    Handlebars.registerPartial('schemaDictionary', Handlebars.template(partialSchemaDictionary));
    Handlebars.registerPartial('schemaEnum', Handlebars.template(partialSchemaEnum));
    Handlebars.registerPartial('schemaGeneric', Handlebars.template(partialSchemaGeneric));
    Handlebars.registerPartial('schemaInterface', Handlebars.template(partialSchemaInterface));
    Handlebars.registerPartial('type', Handlebars.template(partialType));
    Handlebars.registerPartial('typeArray', Handlebars.template(partialTypeArray));
    Handlebars.registerPartial('typeDictionary', Handlebars.template(partialTypeDictionary));
    Handlebars.registerPartial('typeEnum', Handlebars.template(partialTypeEnum));
    Handlebars.registerPartial('typeGeneric', Handlebars.template(partialTypeGeneric));
    Handlebars.registerPartial('typeInterface', Handlebars.template(partialTypeInterface));
    Handlebars.registerPartial('typeReference', Handlebars.template(partialTypeReference));

    return templates;
}
