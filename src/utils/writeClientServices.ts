import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../client/interfaces/Service';
import { HttpClient, Language } from '../index';
import { getFileName } from './getFileName';
import { exportService } from './exportService';
import { Templates } from './readHandlebarsTemplates';
import { format } from './format';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write.
 * @param language The output language (Typescript or javascript).
 * @param httpClient The selected httpClient (fetch or XHR).
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientServices(services: Map<string, Service>, language: Language, httpClient: HttpClient, templates: Templates, outputPath: string): void {
    services.forEach(service => {
        const fileName = getFileName(service.name, language);
        try {
            const templateData = exportService(service);
            const templateResult = templates.service({
                language,
                httpClient,
                ...templateData,
            });
            fs.writeFileSync(path.resolve(outputPath, fileName), format(templateResult));
        } catch (e) {
            throw new Error(`Could not write service: "${fileName}"`);
        }
    });
}
