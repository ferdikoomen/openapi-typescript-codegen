import { resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { formatCode as f } from './formatCode';
import { formatIndentation as i } from './formatIndentation';
import type { Templates } from './registerHandlebarTemplates';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param indent Indentation options (4, 2 or tab)
 * @param additionalModelFileExtension Add file extension for models *.models.*
 * @param additionalServiceFileExtension Add file extension for service *.service.*
 */
export const writeClientModels = async (
    models: Model[],
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    useUnionTypes: boolean,
    indent: Indent,
    additionalModelFileExtension: boolean,
    additionalServiceFileExtension: boolean
): Promise<void> => {
    for (const model of models) {
        const file = resolve(outputPath, `${model.name}${additionalModelFileExtension ? '.models' : ''}.ts`);
        const templateResult = templates.exports.model({
            ...model,
            httpClient,
            useUnionTypes,
            additionalModelFileExtension,
            additionalServiceFileExtension,
        });
        await writeFile(file, i(f(templateResult), indent));
    }
};
