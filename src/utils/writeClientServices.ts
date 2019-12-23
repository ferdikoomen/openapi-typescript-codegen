import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../client/interfaces/Service';
import { Templates } from './readHandlebarsTemplates';
import { exportService } from './exportService';
import { format } from './format';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write.
 * @param templates The loaded handlebar templates.
 * @param outputPath
 */
export function writeClientServices(services: Service[], templates: Templates, outputPath: string): void {
    services.forEach(service => {
        const file = path.resolve(outputPath, `${service.name}.ts`);
        const templateData = exportService(service);
        const templateResult = templates.service(templateData);
        fs.writeFileSync(file, format(templateResult));
    });
}
