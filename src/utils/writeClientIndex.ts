import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { writeFile } from './fileSystem';
import { isDefined } from './isDefined';
import { Templates } from './registerHandlebarTemplates';
import { sortModelsByName } from './sortModelsByName';
import { sortServicesByName } from './sortServicesByName';
import { HttpClient } from '../HttpClient';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param postfix Service name postfix
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param additionalModelFileExtension Add file extension for models *.models.*
 * @param additionalServiceFileExtension Add file extension for service *.service.*
 * @param clientName Custom client class name
 */
export const writeClientIndex = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    postfix: string,
    httpClient: HttpClient,
    additionalModelFileExtension: boolean,
    additionalServiceFileExtension: boolean,
    clientName?: string
): Promise<void> => {
    const templateResult = templates.index({
        exportCore,
        exportServices,
        exportModels,
        exportSchemas,
        useUnionTypes,
        postfix,
        clientName,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        exportClient: isDefined(clientName),
        httpClient,
        additionalModelFileExtension,
        additionalServiceFileExtension,
    });

    await writeFile(resolve(outputPath, 'index.ts'), templateResult);
};
