import { Client } from '../client/interfaces/Client';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { getSortedModels } from './getSortedModels';
import { getSortedServices } from './getSortedServices';
import { Language } from '../index';
import { getFileName } from './getFileName';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client: Client object, containing, models, schemas and services.
 * @param language: The output language (Typescript or javascript).
 * @param template: The template that is used to write the file.
 * @param outputPath:
 */
export function writeClientIndex(client: Client, language: Language, template: handlebars.TemplateDelegate, outputPath: string): void {
    const fileName: string = getFileName('index', language);
    try {
        fs.writeFileSync(
            path.resolve(outputPath, fileName),
            template({
                server: client.server,
                version: client.version,
                models: getSortedModels(client.models),
                services: getSortedServices(client.services),
            })
        );
    } catch (e) {
        throw new Error(`Could not write index: "${fileName}"`);
    }
}
