import { resolve } from 'path';
import { ServiceOptions } from '..';

import type { Service } from '../client/interfaces/Service';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

const VERSION_TEMPLATE_STRING = 'OpenAPI.VERSION';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 * @param postfix: Service name postfix
 */
export async function writeClientServices(
    services: Service[],
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    useUnionTypes: boolean,
    useOptions: boolean,
    postfix: string,
    serviceOptions: ServiceOptions
): Promise<void> {
    for (const service of services) {
        const file = resolve(outputPath, `${service.name}${postfix}.ts`);
        const useVersion = service.operations.some(operation => operation.path.includes(VERSION_TEMPLATE_STRING));
        const templateResult = templates.exports.service({
            ...service,
            httpClient,
            useUnionTypes,
            useVersion,
            useOptions,
            postfix,
            ...serviceOptions,
        });
        await writeFile(file, format(templateResult));
    }
}
