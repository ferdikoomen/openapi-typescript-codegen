import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { Schema } from '../client/interfaces/Schema';
import * as path from 'path';
import { Language } from '../index';
import { getFileName } from './getFileName';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param schemas: Array of Schemas to write.
 * @param language: The output language (Typescript or javascript).
 * @param template: The template that is used to write the file.
 * @param outputPath:
 */
export function writeClientSchemas(schemas: Schema[], language: Language, template: handlebars.TemplateDelegate, outputPath: string): void {
    schemas.forEach(schema => {
        const fileName = getFileName(schema.name, language);
        try {
            fs.writeFileSync(path.resolve(outputPath, fileName), template(schema));
        } catch (e) {
            throw new Error(`Could not write schema: "${fileName}"`);
        }
    });
}
