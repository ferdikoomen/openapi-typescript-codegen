import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { Model } from '../client/interfaces/Model';
import * as path from 'path';
import { Language } from '../index';
import { getFileName } from './getFileName';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models: Array of Models to write.
 * @param language: The output language (Typescript or javascript).
 * @param template: The template that is used to write the file.
 * @param outputPath:
 */
export function writeClientModels(models: Model[], language: Language, template: handlebars.TemplateDelegate, outputPath: string): void {
    models.forEach(model => {
        const fileName: string = getFileName(model.name, language);
        try {
            fs.writeFileSync(
                path.resolve(outputPath, fileName),
                template({
                    ...model,
                    // properties: Array.from(model.properties.values()), // TODO in cleanup?
                })
            );
        } catch (e) {
            throw new Error(`Could not write model: "${fileName}"`);
        }
    });
}
