import * as path from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 */
export async function writeClientCore(client: Client, templates: Templates, outputPath: string, httpClient: HttpClient): Promise<void> {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };
    await writeFile(path.resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(path.resolve(outputPath, 'ApiError.ts'), templates.core.apiError({}));
    await writeFile(path.resolve(outputPath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await writeFile(path.resolve(outputPath, 'ApiResult.ts'), templates.core.apiResult({}));
    await writeFile(path.resolve(outputPath, 'request.ts'), templates.core.request(context));
}
