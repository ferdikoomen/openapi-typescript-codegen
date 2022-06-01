import camelcase from 'camelcase';
import { resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import { Service } from '../client/interfaces/Service';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import { writeFile } from './fileSystem';
import { formatCode as f } from './formatCode';
import { formatIndentation as i } from './formatIndentation';
import { toHyphenCase } from './hyphenCase';
import type { Templates } from './registerHandlebarTemplates';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useUnionTypes Use union types instead of enums
 * @param indent Indentation options (4, 2 or tab)
 */
export const writeQueryModels = async (
    services: Service[],
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient,
    useUnionTypes: boolean,
    indent: Indent
): Promise<void> => {
    for (const service of services) {
        for (const operation of service.operations) {
            if (operation.parameters.filter(param => param.in !== 'body').length === 0) {
                continue;
            }
            const modelName = camelcase(operation.name, { pascalCase: true });
            const modelNameHyphens = toHyphenCase(modelName);
            const file = resolve(outputPath, `${modelNameHyphens}-params.ts`);

            const templateResult = templates.exports.queryModel({
                ...operation,
                httpClient,
                useUnionTypes,
            });
            await writeFile(file, i(f(templateResult), indent));
        }
    }
};
