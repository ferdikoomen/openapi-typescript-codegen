import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { Service } from '../client/interfaces/Service';
import { Language } from '../index';
import { getFileName } from './getFileName';
import { exportService } from './exportService';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services: Array of Services to write.
 * @param language: The output language (Typescript or javascript).
 * @param template: The template that is used to write the file.
 * @param outputPath:
 */
export function writeClientServices(services: Map<string, Service>, language: Language, template: handlebars.TemplateDelegate, outputPath: string): void {
    services.forEach(service => {
        const fileName = getFileName(service.name, language);
        try {
            const templateData = exportService(service);
            const templateResult = template(templateData);
            fs.writeFileSync(path.resolve(outputPath, fileName), templateResult);
        } catch (e) {
            throw new Error(`Could not write service: "${fileName}"`);
        }
    });
}
