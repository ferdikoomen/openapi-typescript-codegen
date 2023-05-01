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
import { writeClientClassCustomTemplate } from './utils/writeClientCustomTemplate/clientClass';
import { writeClientIndexCustomTemplate } from './utils/writeClientCustomTemplate/index';
import { writeClientServicesCustomTemplate } from './utils/writeClientCustomTemplate/services';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

export type Options = {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient;
    clientName?: string;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportClient?: boolean;
    exportIndex?: boolean;
    exportSchemas?: boolean;
    indent?: Indent;
    postfixServices?: string;
    postfixModels?: string;
    request?: string;
    serviceTemplate?: string;
    clientTemplate?: string;
    indexTemplate?: string;
    write?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param request Path to custom request file
 * @param write Write the files to disk (true or false)
 */
export const generate = async ({
    input,
    output,
    httpClient = HttpClient.FETCH,
    clientName,
    useOptions = false,
    useUnionTypes = false,
    exportCore = true,
    exportServices = true,
    exportModels = true,
    exportClient = true,
    exportIndex = true,
    exportSchemas = false,
    indent = Indent.SPACE_4,
    postfixServices = 'Service',
    postfixModels = '',
    request,
    serviceTemplate,
    clientTemplate,
    indexTemplate,
    write = true,
}: Options): Promise<void> => {
    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    let clientFinal;
    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parseV2(openApi);
            clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportClient,
                exportIndex,
                exportSchemas,
                indent,
                postfixServices,
                postfixModels,
                clientName,
                request
            );
            break;
        }

        case OpenApiVersion.V3: {
            const client = parseV3(openApi);
            clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                httpClient,
                useOptions,
                useUnionTypes,
                exportCore,
                exportServices,
                exportModels,
                exportClient,
                exportIndex,
                exportSchemas,
                indent,
                postfixServices,
                postfixModels,
                clientName,
                request
            );
            break;
        }
    }

    if (serviceTemplate)
        await writeClientServicesCustomTemplate(
            clientFinal,
            output,
            httpClient,
            useOptions,
            useUnionTypes,
            indent,
            postfixServices,
            postfixModels,
            serviceTemplate,
            exportClient,
            exportModels,
            exportSchemas,
            clientName
        );

    if (clientTemplate)
        await writeClientClassCustomTemplate(
            clientFinal,
            output,
            httpClient,
            useOptions,
            useUnionTypes,
            indent,
            postfixServices,
            clientTemplate,
            clientName
        );

    if (indexTemplate)
        await writeClientIndexCustomTemplate(
            clientFinal,
            output,
            httpClient,
            useOptions,
            useUnionTypes,
            indent,
            postfixServices,
            postfixModels,
            indexTemplate,
            exportCore,
            exportServices,
            exportModels,
            exportSchemas,
            exportClient,
            clientName
        );
};

export default {
    HttpClient,
    generate,
};
