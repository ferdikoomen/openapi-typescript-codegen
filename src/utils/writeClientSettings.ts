import * as path from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI configuration file "OpenAPI.ts"
 * @param client Client object, containing, models, schemas and services.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 * @param httpClient The selected httpClient (fetch or XHR).
 */
export async function writeClientSettings(client: Client, templates: Templates, outputPath: string, httpClient: HttpClient): Promise<void> {
    await writeFile(
        path.resolve(outputPath, 'OpenAPI.ts'),
        templates.settings({
            httpClient,
            server: client.server,
            version: client.version,
        })
    );
}
