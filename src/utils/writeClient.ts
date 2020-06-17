import * as path from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { copyFile, mkdir, rmdir } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';
import { writeClientSettings } from './writeClientSettings';

async function copySupportFile(filePath: string, outputPath: string): Promise<void> {
    await copyFile(path.resolve(__dirname, `../src/templates/${filePath}`), path.resolve(outputPath, filePath));
}

/**
 * Write our OpenAPI client, using the given templates at the given output path.
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates.
 * @param output Directory to write the generated files to.
 * @param httpClient The selected httpClient (fetch or XHR).
 * @param useOptions Use options or arguments functions.
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
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean
): Promise<void> {
    const outputPath = path.resolve(process.cwd(), output);
    const outputPathCore = path.resolve(outputPath, 'core');
    const outputPathModels = path.resolve(outputPath, 'models');
    const outputPathSchemas = path.resolve(outputPath, 'schemas');
    const outputPathServices = path.resolve(outputPath, 'services');

    // Clean output directory
    await rmdir(outputPath);
    await mkdir(outputPath);

    if (exportCore) {
        await mkdir(outputPathCore);
        await copySupportFile('core/ApiError.ts', outputPath);
        await copySupportFile('core/getFormData.ts', outputPath);
        await copySupportFile('core/getQueryString.ts', outputPath);
        await copySupportFile('core/isSuccess.ts', outputPath);
        await copySupportFile('core/request.ts', outputPath);
        await copySupportFile('core/RequestOptions.ts', outputPath);
        await copySupportFile('core/requestUsingFetch.ts', outputPath);
        await copySupportFile('core/requestUsingXHR.ts', outputPath);
        await copySupportFile('core/Result.ts', outputPath);
    }

    if (exportServices) {
        await mkdir(outputPathServices);
        await writeClientSettings(client, templates, outputPathCore, httpClient);
        await writeClientServices(client.services, templates, outputPathServices, useOptions);
    }

    if (exportSchemas) {
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas);
    }

    if (exportModels) {
        await mkdir(outputPathModels);
        await copySupportFile('models/Dictionary.ts', outputPath);
        await writeClientModels(client.models, templates, outputPathModels);
    }

    await writeClientIndex(client, templates, outputPath, exportCore, exportServices, exportModels, exportSchemas);
}
