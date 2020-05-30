import * as path from 'path';

import { Model } from '../client/interfaces/Model';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 */
export async function writeClientModels(models: Model[], templates: Templates, outputPath: string): Promise<void> {
    for (const model of models) {
        const file = path.resolve(outputPath, `${model.name}.ts`);
        const templateResult = templates.model(model);
        await writeFile(file, format(templateResult));
    }
}
