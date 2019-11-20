import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../client/interfaces/Service';
import { Language } from '../index';
import { getFileName } from './getFileName';
import { exportService } from './exportService';
import { Templates } from './readHandlebarsTemplates';
import { fixIndentation } from './fixIndentation';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services: Array of Services to write.
 * @param language: The output language (Typescript or javascript).
 * @param templates: The loaded handlebar templates.
 * @param outputPath:
 */
export function writeClientServices(services: Map<string, Service>, language: Language, templates: Templates, outputPath: string): void {
    services.forEach(service => {
        const fileName = getFileName(service.name, language);
        try {
            const templateData = exportService(service);
            const templateResult = templates.model(templateData);
            fs.writeFileSync(path.resolve(outputPath, fileName), fixIndentation(templateResult));
        } catch (e) {
            throw new Error(`Could not write service: "${fileName}"`);
        }
    });
}
