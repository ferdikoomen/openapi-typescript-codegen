import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { readHandlebarsTemplates } from './utils/readHandlebarsTemplates';
import { writeClient } from './utils/writeClient';

export enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
}

export interface Options {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    write?: boolean;
}

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec.
 * @param output The relative location of the output directory.
 * @param httpClient The selected httpClient (fetch or XHR).
 * @param useOptions Use options or arguments functions.
 * @param useUnionTypes Use inclusive union types.
 * @param exportCore: Generate core client classes.
 * @param exportServices: Generate services.
 * @param exportModels: Generate models.
 * @param exportSchemas: Generate schemas.
 * @param write Write the files to disk (true or false).
 */
export function generate({
    input,
    output,
    httpClient = HttpClient.FETCH,
    useOptions = false,
    useUnionTypes = false,
    exportCore = true,
    exportServices = true,
    exportModels = true,
    exportSchemas = false,
    write = true,
}: Options): void {
    try {
        // Load the specification, read the OpenAPI version and load the
        // handlebar templates for the given language
        const openApi = isString(input) ? getOpenApiSpec(input) : input;
        const openApiVersion = getOpenApiVersion(openApi);
        const templates = readHandlebarsTemplates();

        switch (openApiVersion) {
            case OpenApiVersion.V2: {
                const client = parseV2(openApi);
                const clientFinal = postProcessClient(client, useUnionTypes);
                if (write) {
                    writeClient(clientFinal, templates, output, httpClient, useOptions, exportCore, exportServices, exportModels, exportSchemas);
                }
                break;
            }

            case OpenApiVersion.V3: {
                const client = parseV3(openApi);
                const clientFinal = postProcessClient(client, useUnionTypes);
                if (write) {
                    writeClient(clientFinal, templates, output, httpClient, useOptions, exportCore, exportServices, exportModels, exportSchemas);
                }
                break;
            }
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
