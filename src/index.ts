import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { parse as parseV2 } from './openApi/v2';
import { OpenApi as OpenApiV2 } from './openApi/v2/interfaces/OpenApi';
import { OpenApi as OpenApiV3 } from './openApi/v3/interfaces/OpenApi';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';
import { AnyOpenApi } from './openApi';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

export type Options = {
    input: string | AnyOpenApi;
    output?: string;
    factories: string;
    httpClient?: HttpClient;
    clientName?: string;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportSchemas?: boolean;
    indent?: Indent;
    postfixServices?: string;
    postfixModels?: string;
    write?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param factories The relative location of the the fifle with factories (createServerResolver, createClientResolver, createHook)
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param write Write the files to disk (true or false)
 */
export const generate = async ({
    input,
    output = 'generated/open-api',
    factories,
    httpClient = HttpClient.FETCH,
    clientName,
    useUnionTypes = true,
    exportCore = true,
    exportServices = true,
    exportSchemas = false,
    indent = Indent.SPACE_4,
    postfixServices = 'Service',
    postfixModels = '',
    write = true,
}: Options): Promise<void> => {
    if (!factories) {
        throw new Error(`Argument 'factories' is require`);
    }

    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
    });

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            const client = parseV2(openApi as OpenApiV2);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                factories,
                httpClient,
                useUnionTypes,
                exportCore,
                exportServices,
                exportSchemas,
                indent,
                postfixServices,
                postfixModels,
                clientName
            );
            break;
        }

        case OpenApiVersion.V3: {
            const client = parseV3(openApi as OpenApiV3);
            const clientFinal = postProcessClient(client);
            if (!write) break;
            await writeClient(
                clientFinal,
                templates,
                output,
                factories,
                httpClient,
                useUnionTypes,
                exportCore,
                exportServices,
                exportSchemas,
                indent,
                postfixServices,
                postfixModels,
                clientName
            );
            break;
        }
    }
};

export default {
    HttpClient,
    generate,
};
