import type { Client } from '../client/interfaces/Client';

import { resolve } from 'path';

import { writeFile } from './fileSystem.js';
import { Templates } from './registerHandlebarTemplates.js';
import { sortModelsByName } from './sortModelsByName.js';
import { sortServicesByName } from './sortServicesByName.js';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param exportServices Generate services
 * @param exportSchemas Generate schemas
 * @param postfixModels Model name postfix
 */
export const writeClientIndex = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    useUnionTypes: boolean,
    exportServices: boolean,
    exportSchemas: boolean,
    postfixModels: string
): Promise<void> => {
    const templateResult = templates.index({
        exportServices,
        exportSchemas,
        useUnionTypes,
        postfixModels,
        server: client.server,
        version: client.version,
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
    });

    await writeFile(resolve(outputPath, 'index.ts'), templateResult);
};
