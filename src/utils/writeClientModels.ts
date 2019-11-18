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
        try {
            const templateData = exportModel(model);
            const templateResult = templates.model(templateData, {
                partials: {
                    exportGeneric: templates.exportGeneric,
                    exportReference: templates.exportReference,
                    exportInterface: templates.exportInterface,
                    exportEnum: templates.exportEnum,
                    exportDictionary: templates.exportDictionary,
                    exportArray: templates.exportArray,
                    validation: templates.validation,
                    validationForGeneric: templates.validationForGeneric,
                    validationForReference: templates.validationForReference,
                    validationForEnum: templates.validationForEnum,
                    validationForInterface: templates.validationForInterface,
                    validationForDictionary: templates.validationForDictionary,
                    validationForArray: templates.validationForArray,
                    type: templates.type,
                    typeForArray: templates.typeForArray,
                    typeForDictionary: templates.typeForDictionary,
                    typeForEnum: templates.typeForEnum,
                    typeForInterface: templates.typeForInterface,
                    typeForReference: templates.typeForReference,
                    typeForGeneric: templates.typeForGeneric,
                },
            });
            fs.writeFileSync(path.resolve(outputPath, fileName), templateResult);
        } catch (e) {
            throw new Error(`Could not write model: "${fileName}"`);
        }
    });
}
