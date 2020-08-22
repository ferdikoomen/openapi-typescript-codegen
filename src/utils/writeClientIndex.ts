import * as path from 'path';

import { Client } from '../client/interfaces/Client';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { sortModelsByName } from './sortModelsByName';
import { sortServicesByName } from './sortServicesByName';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 * @param exportCore: Generate core.
 * @param exportServices: Generate services.
 * @param exportModels: Generate models.
 * @param exportSchemas: Generate schemas.
 */
export async function writeClientIndex(
    client: Client,
    templates: Templates,
    outputPath: string,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean
): Promise<void> {
    await writeFile(
        path.resolve(outputPath, 'index.ts'),
        templates.index({
            exportCore,
            exportServices,
            exportModels,
            exportSchemas,
            server: client.server,
            version: client.version,
            models: sortModelsByName(client.models),
            services: sortServicesByName(client.services),
        })
    );
}
