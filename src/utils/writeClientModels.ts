import * as fs from 'fs';
import * as path from 'path';

import { Model } from '../client/interfaces/Model';
import { format } from './format';
import { Templates } from './readHandlebarsTemplates';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 */
export function writeClientModels(models: Model[], templates: Templates, outputPath: string): void {
    models.forEach(model => {
        const file = path.resolve(outputPath, `${model.name}.ts`);
        const templateResult = templates.model(model);
        fs.writeFileSync(file, format(templateResult));
    });
}
