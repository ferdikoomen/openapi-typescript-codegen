import * as path from 'path';

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
    await writeFile(path.resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(path.resolve(outputPath, 'getFormData.ts'), templates.core.getFormData(context));
    await writeFile(path.resolve(outputPath, 'getQueryString.ts'), templates.core.getQueryString(context));
    await writeFile(path.resolve(outputPath, 'getUrl.ts'), templates.core.getUrl(context));
    await writeFile(path.resolve(outputPath, 'isSuccess.ts'), templates.core.isSuccess(context));
    await writeFile(path.resolve(outputPath, 'catchGenericError.ts'), templates.core.catchGenericError(context));
    await writeFile(path.resolve(outputPath, 'request.ts'), templates.core.request(context));
    await writeFile(path.resolve(outputPath, 'RequestOptions.ts'), templates.core.requestOptions(context));
    await writeFile(path.resolve(outputPath, 'requestUsingFetch.ts'), templates.core.requestUsingFetch(context));
    await writeFile(path.resolve(outputPath, 'requestUsingXHR.ts'), templates.core.requestUsingXHR(context));
    await writeFile(path.resolve(outputPath, 'requestUsingNode.ts'), templates.core.requestUsingNode(context));
    await writeFile(path.resolve(outputPath, 'Response.ts'), templates.core.response(context));
    await writeFile(path.resolve(outputPath, 'ResponseError.ts'), templates.core.responseError(context));
}
