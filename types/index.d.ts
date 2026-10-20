export declare enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
    NODE = 'node',
    AXIOS = 'axios',
    ANGULAR = 'angular',
}

export declare enum Indent {
    SPACE_4 = '4',
    SPACE_2 = '2',
    TAB = 'tab',
}

export type TemplateOverrideNames =
    // Main templates (entry points for the files we write to disk)
    | 'index'
    | 'client'
    | 'exportModel'
    | 'exportSchema'
    | 'exportService'
    | 'settings'
    | 'apiError'
    | 'apiRequestOptions'
    | 'apiResult'
    | 'cancelablePromise'
    | 'request'
    | 'baseHttpRequest'
    | 'httpRequest'
    // Partials for the generations of the models, services, etc.
    | 'exportEnum'
    | 'exportInterface'
    | 'exportComposition'
    | 'exportType'
    | 'header'
    | 'isNullable'
    | 'isReadOnly'
    | 'isRequired'
    | 'parameters'
    | 'result'
    | 'schema'
    | 'schemaArray'
    | 'schemaDictionary'
    | 'schemaEnum'
    | 'schemaGeneric'
    | 'schemaInterface'
    | 'schemaComposition'
    | 'type'
    | 'typeArray'
    | 'typeDictionary'
    | 'typeEnum'
    | 'typeGeneric'
    | 'typeInterface'
    | 'typeReference'
    | 'typeUnion'
    | 'typeIntersection'
    | 'base'
    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    | 'functions/catchErrorCodes'
    | 'functions/getFormData'
    | 'functions/getQueryString'
    | 'functions/getUrl'
    | 'functions/isBlob'
    | 'functions/isDefined'
    | 'functions/isFormData'
    | 'functions/isString'
    | 'functions/isStringWithValue'
    | 'functions/isSuccess'
    | 'functions/base64'
    | 'functions/resolve'
    // Specific files for the fetch client implementation
    | 'fetch/getHeaders'
    | 'fetch/getRequestBody'
    | 'fetch/getResponseBody'
    | 'fetch/getResponseHeader'
    | 'fetch/sendRequest'
    | 'fetch/request'
    // Specific files for the xhr client implementation
    | 'xhr/getHeaders'
    | 'xhr/getRequestBody'
    | 'xhr/getResponseBody'
    | 'xhr/getResponseHeader'
    | 'xhr/sendRequest'
    | 'xhr/request'
    // Specific files for the node client implementation
    | 'node/getHeaders'
    | 'node/getRequestBody'
    | 'node/getResponseBody'
    | 'node/getResponseHeader'
    | 'node/sendRequest'
    | 'node/request'
    // Specific files for the axios client implementation
    | 'axios/getHeaders'
    | 'axios/getRequestBody'
    | 'axios/getResponseBody'
    | 'axios/getResponseHeader'
    | 'axios/sendRequest'
    | 'axios/request'
    // Specific files for the angular client implementation
    | 'angular/getHeaders'
    | 'angular/getRequestBody'
    | 'angular/getResponseBody'
    | 'angular/getResponseHeader'
    | 'angular/sendRequest'
    | 'angular/request';

export type Options = {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular';
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    indent?: Indent | '4' | '2' | 'tab';
    postfixServices?: string;
    postfixModels?: string;
    request?: string;
    write?: boolean;
    templateOverrides?: Partial<Record<TemplateOverrideNames, string>>;
};

export declare function generate(options: Options): Promise<void>;

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
};

export default OpenAPI;
