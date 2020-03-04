import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../client/interfaces/Service';
import { Templates } from './readHandlebarsTemplates';
import { format } from './format';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write.
 * @param templates The loaded handlebar templates.
 * @param outputPath Directory to write the generated files to.
 * @param useOptions Use options or arguments functions.
 */
export function writeClientServices(services: Service[], templates: Templates, outputPath: string, useOptions: boolean): void {
    services.forEach(service => {
        const file = path.resolve(outputPath, `${service.name}.ts`);
        const templateResult = templates.service({
            ...service,
            useOptions,
        });
        fs.writeFileSync(file, format(templateResult));
    });
}
