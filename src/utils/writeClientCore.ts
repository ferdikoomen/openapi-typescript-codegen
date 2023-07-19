import type { Client } from '../client/interfaces/Client';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { writeFile } from './fileSystem';
import { formatIndentation as i } from './formatIndentation';
import { getHttpRequestName } from './getHttpRequestName';
import { isDefined } from './isDefined';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param indent Indentation options (4, 2 or tab)
 * @param clientName Custom client class name
 */
export const writeClientCore = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    indent: Indent,
    clientName?: string
): Promise<void> => {
    const httpRequest = getHttpRequestName(httpClient);
    const context = {
        httpClient,
        clientName,
        httpRequest,
        server: client.server,
        version: client.version,
    };

    await writeFile(resolve(outputPath, 'OpenAPI.ts'), i(templates.core.settings(context), indent));
    await writeFile(resolve(outputPath, 'ApiError.ts'), i(templates.core.apiError(context), indent));
    await writeFile(resolve(outputPath, 'ApiRequestOptions.ts'), i(templates.core.apiRequestOptions(context), indent));
    await writeFile(resolve(outputPath, 'ApiResult.ts'), i(templates.core.apiResult(context), indent));
    await writeFile(resolve(outputPath, 'CancelablePromise.ts'), i(templates.core.cancelablePromise(context), indent));

    if (isDefined(clientName)) {
        await writeFile(resolve(outputPath, 'BaseHttpRequest.ts'), i(templates.core.baseHttpRequest(context), indent));
        await writeFile(resolve(outputPath, `${httpRequest}.ts`), i(templates.core.httpRequest(context), indent));
    }
};
