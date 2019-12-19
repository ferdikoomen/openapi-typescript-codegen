import * as fs from 'fs';
import * as path from 'path';
import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { Templates } from './readHandlebarsTemplates';

export function writeClientSettings(client: Client, httpClient: HttpClient, templates: Templates, outputPath: string): void {
    fs.writeFileSync(
        path.resolve(outputPath, 'OpenAPI.ts'),
        templates.settings({
            httpClient,
            server: client.server,
            version: client.version,
        })
    );
}
