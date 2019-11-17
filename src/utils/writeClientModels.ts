import * as fs from 'fs';
import { Model } from '../client/interfaces/Model';
import * as path from 'path';
import { Language } from '../index';
import { getFileName } from './getFileName';
import { exportModel } from './exportModel';
import { Templates } from './readHandlebarsTemplates';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models: Array of Models to write.
 * @param language: The output language (Typescript or javascript).
 * @param templates: The loaded handlebar templates.
 * @param outputPath:
 */
export function writeClientModels(models: Map<string, Model>, language: Language, templates: Templates, outputPath: string): void {
    models.forEach(model => {
        const fileName = getFileName(model.name, language);
        // try {
        const templateData = exportModel(model);
        const templateResult = templates.model(templateData, {
            partials: {
                exportInterface: templates.exportInterface,
                exportEnum: templates.exportEnum,
                exportType: templates.exportType,
                validation: templates.validation,
                type: templates.type,
            },
        });
        fs.writeFileSync(path.resolve(outputPath, fileName), templateResult);
        // } catch (e) {
        //     throw new Error(`Could not write model: "${fileName}"`);
        // }
    });
}
