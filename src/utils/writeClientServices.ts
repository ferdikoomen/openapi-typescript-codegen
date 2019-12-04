import * as fs from 'fs';
import * as path from 'path';
import { Language } from '../index';
import { Service } from '../client/interfaces/Service';
import { Templates } from './readHandlebarsTemplates';
import { exportService } from './exportService';
import { format } from './format';
import { getFileName } from './getFileName';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write.
 * @param language The output language (Typescript or javascript).
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientServices(services: Service[], language: Language, templates: Templates, outputPath: string): void {
    services.forEach(service => {
        const fileName = getFileName(service.name, language);
        try {
            const templateData = exportService(service);
            const templateResult = templates.service(templateData);
            fs.writeFileSync(path.resolve(outputPath, fileName), format(templateResult));
        } catch (e) {
            throw new Error(`Could not write service: "${fileName}"`);
        }
    });
}
