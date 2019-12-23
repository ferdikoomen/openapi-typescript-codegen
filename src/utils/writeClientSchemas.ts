import * as fs from 'fs';
import * as path from 'path';
import { Model } from '../client/interfaces/Model';
import { Templates } from './readHandlebarsTemplates';
import { exportModel } from './exportModel';
import { format } from './format';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write.
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientSchemas(models: Model[], templates: Templates, outputPath: string): void {
    models.forEach(model => {
        const file = path.resolve(outputPath, `$${model.name}.ts`);
        const templateData = exportModel(model);
        const templateResult = templates.schema(templateData);
        fs.writeFileSync(file, format(templateResult));
    });
}
