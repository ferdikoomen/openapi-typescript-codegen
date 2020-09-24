import { resolve } from 'path';

import { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 * @param httpClient The selected httpClient (fetch or XHR).
 */
export async function writeClientCore(client: Client, templates: Templates, outputPath: string, httpClient: HttpClient): Promise<void> {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };
    await writeFile(resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(resolve(outputPath, 'ApiError.ts'), templates.core.apiError(context));
    await writeFile(resolve(outputPath, 'getFormData.ts'), templates.core.getFormData(context));
    await writeFile(resolve(outputPath, 'getQueryString.ts'), templates.core.getQueryString(context));
    await writeFile(resolve(outputPath, 'isSuccess.ts'), templates.core.isSuccess(context));
    await writeFile(resolve(outputPath, 'request.ts'), templates.core.request(context));
    await writeFile(resolve(outputPath, 'RequestOptions.ts'), templates.core.requestOptions(context));
    await writeFile(resolve(outputPath, 'requestUsingFetch.ts'), templates.core.requestUsingFetch(context));
    await writeFile(resolve(outputPath, 'requestUsingXHR.ts'), templates.core.requestUsingXHR(context));
    await writeFile(resolve(outputPath, 'Result.ts'), templates.core.result(context));
}
