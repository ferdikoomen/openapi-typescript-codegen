import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { getHttpRequestName } from './getHttpRequestName';
import { Templates } from './registerHandlebarTemplates';
import { sortModelsByName } from './sortModelsByName';
import { sortServicesByName } from './sortServicesByName';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param clientName Custom client class name
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param postfix: Service name postfix
 * @param exportClient: Generate client class
 * @param httpClient The selected httpClient (fetch, xhr or node)
 */
export async function writeClientIndex(
    client: Client,
    templates: Templates,
    outputPath: string,
    clientName: string,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    postfix: string,
    exportClient: boolean,
    httpClient: HttpClient
): Promise<void> {
    await writeFile(
        resolve(outputPath, 'index.ts'),
        templates.index({
            exportCore,
            exportServices,
            exportModels,
            exportSchemas,
            exportClient,
            useUnionTypes,
            postfix,
            server: client.server,
            version: client.version,
            models: sortModelsByName(client.models),
            services: sortServicesByName(client.services),
            httpRequestName: getHttpRequestName(httpClient),
            clientName,
        })
    );
}
