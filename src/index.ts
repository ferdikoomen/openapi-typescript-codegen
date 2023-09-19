import { Indent } from './Indent.js';
import { parse as parseV2 } from './openApi/v2/index.js';
import { OpenApi as OpenApiV2 } from './openApi/v2/interfaces/OpenApi.js';
import { OpenApi as OpenApiV3 } from './openApi/v3/interfaces/OpenApi.js';
import { parse as parseV3 } from './openApi/v3/index.js';
import { getOpenApiSpec } from './utils/getOpenApiSpec.js';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion.js';
import { isString } from './utils/isString.js';
import { postProcessClient } from './utils/postProcessClient.js';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates.js';
import { writeClient } from './utils/writeClient.js';
import { AnyOpenApi } from './openApi';
import { createRequestParams } from './utils/createRequestParams.js';

export * from './factories/index.js';
export * from './Indent.js';
export * from './utils/createRequestParams.js';

export type Options = {
    input: string | AnyOpenApi;
    output?: string;
    factories: string;
    useUnionTypes?: boolean;
    exportServices?: boolean;
    exportSchemas?: boolean;
    indent?: Indent;
    postfixModels?: string;
    allowImportingTsExtensions?: boolean;
    write?: boolean;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param factories The relative location of the the fifle with factories (createServerResolver, createClientResolver, createHook)
 * @param useUnionTypes Use union types instead of enums
 * @param exportServices Generate services
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixModels Model name postfix
 * @param allowImportingTsExtensions (Generate .ts extentions on imports enstead .js)
 * @param write Write the files to disk (true or false)
 */
export const generate = async ({
    input,
    output = 'generated/open-api',
    factories: factoriesRaw,
    useUnionTypes = true,
    exportServices = true,
    exportSchemas = false,
    indent = Indent.SPACE_4,
    postfixModels = '',
    allowImportingTsExtensions = false,
    write = true,
}: Options): Promise<void> => {
    if (!factoriesRaw) {
        throw new Error(`Argument 'factories' is require`);
    }

    const extention = allowImportingTsExtensions ? '.ts' : '.js';
    const factories = factoriesRaw.replace(/\.(ts|js)$/, '') + extention;

    const openApi = isString(input) ? await getOpenApiSpec(input) : input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
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
                useUnionTypes,
                exportServices,
                exportSchemas,
                indent,
                postfixModels,
                allowImportingTsExtensions
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
                useUnionTypes,
                exportServices,
                exportSchemas,
                indent,
                postfixModels,
                allowImportingTsExtensions
            );
            break;
        }
    }
};

export default {
    Indent,
    generate,
    createRequestParams,
};
