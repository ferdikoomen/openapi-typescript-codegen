import type { Model } from '../client/interfaces/Model';
import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { writeFile } from './fileSystem.js';
import { formatCode as f } from './formatCode.js';
import { formatIndentation as i } from './formatIndentation.js';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param indent Indentation options (4, 2 or tab)
 */
export const writeClientSchemas = async (
    models: Model[],
    templates: Templates,
    outputPath: string,
    useUnionTypes: boolean,
    indent: Indent
): Promise<void> => {
    for (const model of models) {
        const file = resolve(outputPath, `$${model.name}.ts`);
        const templateResult = templates.exports.schema({
            ...model,
            useUnionTypes,
        });
        await writeFile(file, i(f(templateResult), indent));
    }
};
