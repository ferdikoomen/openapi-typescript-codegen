import * as path from 'path';

import type { Service } from '../client/interfaces/Service';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

const VERSION_TEMPLATE_STRING = 'OpenAPI.VERSION';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param useUnionTypes Use union types instead of enums
 * @param useOptions Use options or arguments functions
 */
export async function writeClientServices(services: Service[], templates: Templates, outputPath: string, useUnionTypes: boolean, useOptions: boolean): Promise<void> {
    for (const service of services) {
        const file = path.resolve(outputPath, `${service.name}.ts`);
        const useVersion = service.operations.some(operation => operation.path.includes(VERSION_TEMPLATE_STRING));
        const templateResult = templates.exports.service({
            ...service,
            useUnionTypes,
            useVersion,
            useOptions,
        });
        await writeFile(file, format(templateResult));
    }
}
