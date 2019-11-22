import { Client } from '../client/interfaces/Client';
import * as fs from 'fs';
import * as path from 'path';
import { HttpClient, Language } from '../index';
import { getFileName } from './getFileName';
import { Templates } from './readHandlebarsTemplates';

export function writeClientSettings(client: Client, language: Language, httpClient: HttpClient, templates: Templates, outputPath: string): void {
    const fileName = getFileName('OpenAPI', language);
    try {
        fs.writeFileSync(
            path.resolve(outputPath, fileName),
            templates.settings({
                language,
                httpClient,
                server: client.server,
                version: client.version,
            })
        );
    } catch (e) {
        console.log(e);
        throw new Error(`Could not write settings: "${fileName}"`);
    }
}
