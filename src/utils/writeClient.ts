import { resolve } from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { mkdir, rmdir } from './fileSystem';
import { isSubDirectory } from './isSubdirectory';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';

/**
 * Write our OpenAPI client, using the given templates at the given output path.
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates.
 * @param output Directory to write the generated files to.
 * @param httpClient The selected httpClient (fetch or XHR).
 * @param useOptions Use options or arguments functions.
 * @param useUnionTypes Use union types or enums.
 * @param exportCore: Generate core.
 * @param exportServices: Generate services.
 * @param exportModels: Generate models.
 * @param exportSchemas: Generate schemas.
 */
export async function writeClient(
    client: Client,
    templates: Templates,
    output: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean
): Promise<void> {
    const outputPath = resolve(process.cwd(), output);
    const outputPathCore = resolve(outputPath, 'core');
    const outputPathModels = resolve(outputPath, 'models');
    const outputPathSchemas = resolve(outputPath, 'schemas');
    const outputPathServices = resolve(outputPath, 'services');

    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    await rmdir(outputPath);
    await mkdir(outputPath);

    if (exportCore) {
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, httpClient);
    }

    if (exportServices) {
        await mkdir(outputPathServices);
        await writeClientServices(client.services, templates, outputPathServices, useOptions);
    }

    if (exportSchemas) {
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas);
    }

    if (exportModels) {
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels);
    }

    await writeClientIndex(client, templates, outputPath, exportCore, exportServices, exportModels, exportSchemas);
}
