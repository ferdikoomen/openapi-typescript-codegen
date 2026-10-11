import Handlebars from 'handlebars/runtime';

import { TemplateOverrideNames } from '../../types/index';
import { HttpClient } from '../HttpClient';
import templateClient from '../templates/client.hbs';
import angularGetHeaders from '../templates/core/angular/getHeaders.hbs';
import angularGetRequestBody from '../templates/core/angular/getRequestBody.hbs';
import angularGetResponseBody from '../templates/core/angular/getResponseBody.hbs';
import angularGetResponseHeader from '../templates/core/angular/getResponseHeader.hbs';
import angularRequest from '../templates/core/angular/request.hbs';
import angularSendRequest from '../templates/core/angular/sendRequest.hbs';
import templateCoreApiError from '../templates/core/ApiError.hbs';
import templateCoreApiRequestOptions from '../templates/core/ApiRequestOptions.hbs';
import templateCoreApiResult from '../templates/core/ApiResult.hbs';
import axiosGetHeaders from '../templates/core/axios/getHeaders.hbs';
import axiosGetRequestBody from '../templates/core/axios/getRequestBody.hbs';
import axiosGetResponseBody from '../templates/core/axios/getResponseBody.hbs';
import axiosGetResponseHeader from '../templates/core/axios/getResponseHeader.hbs';
import axiosRequest from '../templates/core/axios/request.hbs';
import axiosSendRequest from '../templates/core/axios/sendRequest.hbs';
import templateCoreBaseHttpRequest from '../templates/core/BaseHttpRequest.hbs';
import templateCancelablePromise from '../templates/core/CancelablePromise.hbs';
import fetchGetHeaders from '../templates/core/fetch/getHeaders.hbs';
import fetchGetRequestBody from '../templates/core/fetch/getRequestBody.hbs';
import fetchGetResponseBody from '../templates/core/fetch/getResponseBody.hbs';
import fetchGetResponseHeader from '../templates/core/fetch/getResponseHeader.hbs';
import fetchRequest from '../templates/core/fetch/request.hbs';
import fetchSendRequest from '../templates/core/fetch/sendRequest.hbs';
import functionBase64 from '../templates/core/functions/base64.hbs';
import functionCatchErrorCodes from '../templates/core/functions/catchErrorCodes.hbs';
import functionGetFormData from '../templates/core/functions/getFormData.hbs';
import functionGetQueryString from '../templates/core/functions/getQueryString.hbs';
import functionGetUrl from '../templates/core/functions/getUrl.hbs';
import functionIsBlob from '../templates/core/functions/isBlob.hbs';
import functionIsDefined from '../templates/core/functions/isDefined.hbs';
import functionIsFormData from '../templates/core/functions/isFormData.hbs';
import functionIsString from '../templates/core/functions/isString.hbs';
import functionIsStringWithValue from '../templates/core/functions/isStringWithValue.hbs';
import functionIsSuccess from '../templates/core/functions/isSuccess.hbs';
import functionResolve from '../templates/core/functions/resolve.hbs';
import templateCoreHttpRequest from '../templates/core/HttpRequest.hbs';
import nodeGetHeaders from '../templates/core/node/getHeaders.hbs';
import nodeGetRequestBody from '../templates/core/node/getRequestBody.hbs';
import nodeGetResponseBody from '../templates/core/node/getResponseBody.hbs';
import nodeGetResponseHeader from '../templates/core/node/getResponseHeader.hbs';
import nodeRequest from '../templates/core/node/request.hbs';
import nodeSendRequest from '../templates/core/node/sendRequest.hbs';
import templateCoreSettings from '../templates/core/OpenAPI.hbs';
import templateCoreRequest from '../templates/core/request.hbs';
import xhrGetHeaders from '../templates/core/xhr/getHeaders.hbs';
import xhrGetRequestBody from '../templates/core/xhr/getRequestBody.hbs';
import xhrGetResponseBody from '../templates/core/xhr/getResponseBody.hbs';
import xhrGetResponseHeader from '../templates/core/xhr/getResponseHeader.hbs';
import xhrRequest from '../templates/core/xhr/request.hbs';
import xhrSendRequest from '../templates/core/xhr/sendRequest.hbs';
import templateExportModel from '../templates/exportModel.hbs';
import templateExportSchema from '../templates/exportSchema.hbs';
import templateExportService from '../templates/exportService.hbs';
import templateIndex from '../templates/index.hbs';
import partialBase from '../templates/partials/base.hbs';
import partialExportComposition from '../templates/partials/exportComposition.hbs';
import partialExportEnum from '../templates/partials/exportEnum.hbs';
import partialExportInterface from '../templates/partials/exportInterface.hbs';
import partialExportType from '../templates/partials/exportType.hbs';
import partialHeader from '../templates/partials/header.hbs';
import partialIsNullable from '../templates/partials/isNullable.hbs';
import partialIsReadOnly from '../templates/partials/isReadOnly.hbs';
import partialIsRequired from '../templates/partials/isRequired.hbs';
import partialParameters from '../templates/partials/parameters.hbs';
import partialResult from '../templates/partials/result.hbs';
import partialSchema from '../templates/partials/schema.hbs';
import partialSchemaArray from '../templates/partials/schemaArray.hbs';
import partialSchemaComposition from '../templates/partials/schemaComposition.hbs';
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
import partialTypeIntersection from '../templates/partials/typeIntersection.hbs';
import partialTypeReference from '../templates/partials/typeReference.hbs';
import partialTypeUnion from '../templates/partials/typeUnion.hbs';
import { preCompileTemplate } from './preCompileTemplate';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

export interface Templates {
    index: Handlebars.TemplateDelegate;
    client: Handlebars.TemplateDelegate;
    exports: {
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
    };
    core: {
        settings: Handlebars.TemplateDelegate;
        apiError: Handlebars.TemplateDelegate;
        apiRequestOptions: Handlebars.TemplateDelegate;
        apiResult: Handlebars.TemplateDelegate;
        cancelablePromise: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        baseHttpRequest: Handlebars.TemplateDelegate;
        httpRequest: Handlebars.TemplateDelegate;
    };
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
export const registerHandlebarTemplates = (root: {
    httpClient: HttpClient;
    useOptions: boolean;
    useUnionTypes: boolean;
    templateOverrides?: Partial<Record<TemplateOverrideNames, string>>;
}): Templates => {
    registerHandlebarHelpers(root);
    const useOverride = (builtIn: TemplateSpecification, override?: string) => {
        return Handlebars.template(preCompileTemplate(override) ?? builtIn);
    };
    const registerPartialOverride = (name: TemplateOverrideNames, builtIn: TemplateSpecification) => {
        return Handlebars.registerPartial(name, useOverride(builtIn, root.templateOverrides?.[name]));
    };

    // Main templates (entry points for the files we write to disk)
    const templates: Templates = {
        index: useOverride(templateIndex, root.templateOverrides?.index),
        client: useOverride(templateClient, root.templateOverrides?.client),
        exports: {
            model: useOverride(templateExportModel, root.templateOverrides?.exportModel),
            schema: useOverride(templateExportSchema, root.templateOverrides?.exportSchema),
            service: useOverride(templateExportService, root.templateOverrides?.exportService),
        },
        core: {
            settings: useOverride(templateCoreSettings, root.templateOverrides?.settings),
            apiError: useOverride(templateCoreApiError, root.templateOverrides?.apiError),
            apiRequestOptions: useOverride(templateCoreApiRequestOptions, root.templateOverrides?.apiRequestOptions),
            apiResult: useOverride(templateCoreApiResult, root.templateOverrides?.apiResult),
            cancelablePromise: useOverride(templateCancelablePromise, root.templateOverrides?.cancelablePromise),
            request: useOverride(templateCoreRequest, root.templateOverrides?.request),
            baseHttpRequest: useOverride(templateCoreBaseHttpRequest, root.templateOverrides?.baseHttpRequest),
            httpRequest: useOverride(templateCoreHttpRequest, root.templateOverrides?.httpRequest),
        },
    };

    // Partials for the generations of the models, services, etc.
    registerPartialOverride('exportEnum', partialExportEnum);
    registerPartialOverride('exportInterface', partialExportInterface);
    registerPartialOverride('exportComposition', partialExportComposition);
    registerPartialOverride('exportType', partialExportType);
    registerPartialOverride('header', partialHeader);
    registerPartialOverride('isNullable', partialIsNullable);
    registerPartialOverride('isReadOnly', partialIsReadOnly);
    registerPartialOverride('isRequired', partialIsRequired);
    registerPartialOverride('parameters', partialParameters);
    registerPartialOverride('result', partialResult);
    registerPartialOverride('schema', partialSchema);
    registerPartialOverride('schemaArray', partialSchemaArray);
    registerPartialOverride('schemaDictionary', partialSchemaDictionary);
    registerPartialOverride('schemaEnum', partialSchemaEnum);
    registerPartialOverride('schemaGeneric', partialSchemaGeneric);
    registerPartialOverride('schemaInterface', partialSchemaInterface);
    registerPartialOverride('schemaComposition', partialSchemaComposition);
    registerPartialOverride('type', partialType);
    registerPartialOverride('typeArray', partialTypeArray);
    registerPartialOverride('typeDictionary', partialTypeDictionary);
    registerPartialOverride('typeEnum', partialTypeEnum);
    registerPartialOverride('typeGeneric', partialTypeGeneric);
    registerPartialOverride('typeInterface', partialTypeInterface);
    registerPartialOverride('typeReference', partialTypeReference);
    registerPartialOverride('typeUnion', partialTypeUnion);
    registerPartialOverride('typeIntersection', partialTypeIntersection);
    registerPartialOverride('base', partialBase);

    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    registerPartialOverride('functions/catchErrorCodes', functionCatchErrorCodes);
    registerPartialOverride('functions/getFormData', functionGetFormData);
    registerPartialOverride('functions/getQueryString', functionGetQueryString);
    registerPartialOverride('functions/getUrl', functionGetUrl);
    registerPartialOverride('functions/isBlob', functionIsBlob);
    registerPartialOverride('functions/isDefined', functionIsDefined);
    registerPartialOverride('functions/isFormData', functionIsFormData);
    registerPartialOverride('functions/isString', functionIsString);
    registerPartialOverride('functions/isStringWithValue', functionIsStringWithValue);
    registerPartialOverride('functions/isSuccess', functionIsSuccess);
    registerPartialOverride('functions/base64', functionBase64);
    registerPartialOverride('functions/resolve', functionResolve);

    // Specific files for the fetch client implementation
    registerPartialOverride('fetch/getHeaders', fetchGetHeaders);
    registerPartialOverride('fetch/getRequestBody', fetchGetRequestBody);
    registerPartialOverride('fetch/getResponseBody', fetchGetResponseBody);
    registerPartialOverride('fetch/getResponseHeader', fetchGetResponseHeader);
    registerPartialOverride('fetch/sendRequest', fetchSendRequest);
    registerPartialOverride('fetch/request', fetchRequest);

    // Specific files for the xhr client implementation
    registerPartialOverride('xhr/getHeaders', xhrGetHeaders);
    registerPartialOverride('xhr/getRequestBody', xhrGetRequestBody);
    registerPartialOverride('xhr/getResponseBody', xhrGetResponseBody);
    registerPartialOverride('xhr/getResponseHeader', xhrGetResponseHeader);
    registerPartialOverride('xhr/sendRequest', xhrSendRequest);
    registerPartialOverride('xhr/request', xhrRequest);

    // Specific files for the node client implementation
    registerPartialOverride('node/getHeaders', nodeGetHeaders);
    registerPartialOverride('node/getRequestBody', nodeGetRequestBody);
    registerPartialOverride('node/getResponseBody', nodeGetResponseBody);
    registerPartialOverride('node/getResponseHeader', nodeGetResponseHeader);
    registerPartialOverride('node/sendRequest', nodeSendRequest);
    registerPartialOverride('node/request', nodeRequest);

    // Specific files for the axios client implementation
    registerPartialOverride('axios/getHeaders', axiosGetHeaders);
    registerPartialOverride('axios/getRequestBody', axiosGetRequestBody);
    registerPartialOverride('axios/getResponseBody', axiosGetResponseBody);
    registerPartialOverride('axios/getResponseHeader', axiosGetResponseHeader);
    registerPartialOverride('axios/sendRequest', axiosSendRequest);
    registerPartialOverride('axios/request', axiosRequest);

    // Specific files for the angular client implementation
    registerPartialOverride('angular/getHeaders', angularGetHeaders);
    registerPartialOverride('angular/getRequestBody', angularGetRequestBody);
    registerPartialOverride('angular/getResponseBody', angularGetResponseBody);
    registerPartialOverride('angular/getResponseHeader', angularGetResponseHeader);
    registerPartialOverride('angular/sendRequest', angularSendRequest);
    registerPartialOverride('angular/request', angularRequest);

    return templates;
};
