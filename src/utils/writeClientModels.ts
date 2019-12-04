import * as fs from 'fs';
import * as path from 'path';
import { Language } from '../index';
import { Model } from '../client/interfaces/Model';
import { Templates } from './readHandlebarsTemplates';
import { exportModel } from './exportModel';
import { format } from './format';
import { getFileName } from './getFileName';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write.
 * @param language The output language (Typescript or javascript).
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientModels(models: Model[], language: Language, templates: Templates, outputPath: string): void {
    models.forEach(model => {
        const fileName = getFileName(model.name, language);
        try {
            const templateData = exportModel(model);
            const templateResult = templates.model(templateData);
            fs.writeFileSync(path.resolve(outputPath, fileName), format(templateResult));
        } catch (e) {
            throw new Error(`Could not write model: "${fileName}"`);
        }
    });
}
