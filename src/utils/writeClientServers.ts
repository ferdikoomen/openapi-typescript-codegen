import type { Service } from '../client/interfaces/Service';
import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { relative, resolve } from 'path';

import { writeFile } from './fileSystem.js';
import { formatCode as f } from './formatCode.js';
import { formatIndentation as i } from './formatIndentation.js';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param factories Absolute path to factories file
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param indent Indentation options (4, 2 or tab)
 * @param allowImportingTsExtensions Generate .ts extentions on imports enstead .js
 */
export const writeClientServers = async (
    services: Service[],
    factories: string,
    templates: Templates,
    outputPath: string,
    indent: Indent,
    allowImportingTsExtensions: boolean
): Promise<void> => {
    const writedFiles = [];
    for (const service of services) {
        const file = resolve(outputPath, `${service.name}.ts`);
        const templateResult = templates.exports.server.resolver({
            service,
            factories: relative(outputPath, factories),
            allowImportingTsExtensions,
        });
        await writeFile(file, i(f(templateResult), indent));
        writedFiles.push({ fileName: service.name });
    }
    if (writedFiles.length) {
        const file = resolve(outputPath, 'index.ts');
        const templateResult = templates.exports.server.index({ writedFiles, allowImportingTsExtensions });
        await writeFile(file, i(f(templateResult), indent));
    }
};
