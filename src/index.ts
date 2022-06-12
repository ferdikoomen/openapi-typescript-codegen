import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

export type Options = {
    input: string | Record<string, any>;
    output: string;
    modelsDirName?: string;
    serverOutput?: string;
    serverDirName?: string;
    serverModelImportPath?: string;
    serverApiTypesImportPath?: string;
    serverReqTypeName?: string;
    serverResTypeName?: string;
    exportRouteHandler?: boolean;
    transformReqFuncName?: string;
    transformResFuncName?: string;
    transformFuncPath?: string;
    httpClient?: HttpClient;
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportServerInterfaces?: boolean;
    exportModels?: boolean;
    exportQueryModels?: boolean;
    exportSchemas?: boolean;
    indent?: Indent;
    postfix?: string;
    request?: string;
    write?: boolean;
    createIndex?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param modelsDirName Models directory name
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfix Service name postfix
 * @param request Path to custom request file
 * @param write Write the files to disk (true or false)
 * @param createIndex Generate barrel index file
 */
export const generate = async ({
    input,
    output,
    modelsDirName = 'models',
    serverOutput,
    serverDirName = 'server',
    serverModelImportPath = '',
    serverApiTypesImportPath = '',
    serverReqTypeName = 'ApiRequestWrapper',
    serverResTypeName = 'ApiResponseWrapper',
    exportRouteHandler = false,
    transformReqFuncName = 'transformApiRequest',
    transformResFuncName = 'transformApiResponse',
    transformFuncPath = './util/transform-api-request',
    httpClient = HttpClient.FETCH,
    clientName,
    useOptions = false,
    useUnionTypes = false,
    exportCore = true,
    exportServices = true,
    exportModels = true,
    exportQueryModels = true,
    exportSchemas = false,
    exportServerInterfaces = true,
    indent = Indent.SPACE_4,
    postfix = 'Service',
    request,
    write = true,
    createIndex = true,
}: Options): Promise<void> => {
    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parseV2(openApi);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                modelsDirName,
                serverOutput ?? output,
                serverDirName,
                serverModelImportPath,
                serverApiTypesImportPath,
                serverReqTypeName,
                serverResTypeName,
                exportRouteHandler,
                transformReqFuncName,
                transformResFuncName,
                transformFuncPath,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportServerInterfaces,
                exportModels,
                exportQueryModels,
                exportSchemas,
                indent,
                postfix,
                clientName,
                request,
                createIndex
            );
            break;
        }

        case OpenApiVersion.V3: {
            const client = parseV3(openApi);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                modelsDirName,
                serverOutput ?? output,
                serverDirName,
                serverModelImportPath,
                serverApiTypesImportPath,
                serverReqTypeName,
                serverResTypeName,
                exportRouteHandler,
                transformReqFuncName,
                transformResFuncName,
                transformFuncPath,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportServerInterfaces,
                exportModels,
                exportQueryModels,
                exportSchemas,
                indent,
                postfix,
                clientName,
                request
            );
            break;
        }
    }
};

export default {
    HttpClient,
    generate,
};
