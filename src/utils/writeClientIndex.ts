import * as fs from 'fs';
import * as path from 'path';
import { Client } from '../client/interfaces/Client';
import { Language } from '../index';
import { Templates } from './readHandlebarsTemplates';
import { getFileName } from './getFileName';
import { getModelNames } from './getModelNames';
import { getServiceNames } from './getServiceNames';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client object, containing, models, schemas and services.
 * @param language The output language (Typescript or javascript).
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientIndex(client: Client, language: Language, templates: Templates, outputPath: string): void {
    const fileName = getFileName('index', language);
    try {
        fs.writeFileSync(
            path.resolve(outputPath, fileName),
            templates.index({
                server: client.server,
                version: client.version,
                models: getModelNames(client.models),
                services: getServiceNames(client.services),
            })
        );
    } catch (e) {
        throw new Error(`Could not write index: "${fileName}"`);
    }
}
