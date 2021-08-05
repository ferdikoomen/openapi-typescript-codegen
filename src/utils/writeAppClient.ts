import { resolve } from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { getHttpRequestName } from './getHttpRequestName';
import { Templates } from './registerHandlebarTemplates';
import { sortServicesByName } from './sortServicesByName';

/**
 * Generate App Client class using the Handlebar template and write to disk.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param clientName Client class name
 * @param postfix Service name postfix
 */
export async function writeAppClient(
    client: Client,
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    clientName: string,
    postfix: string
): Promise<void> {
    await writeFile(
        resolve(outputPath, 'client.ts'),
        templates.client({
            services: sortServicesByName(client.services)
                .filter(s => s.name !== 'Service')
                .map(s => ({
                    name: s.name + postfix,
                    shortName: s.name.replace('Service', '').toLowerCase(),
                })),
            service: client.services.find(s => s.name === 'Service'),
            clientName,
            httpClientRequest: getHttpRequestName(httpClient),
            server: client.server,
            version: client.version,
            postfix,
        })
    );
}
