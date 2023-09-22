import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { writeFile } from './fileSystem.js';
import { formatCode as f } from './formatCode.js';
import { formatIndentation as i } from './formatIndentation.js';
import { Service } from '../client/interfaces/Service.js';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param indent Indentation options (4, 2 or tab)
 * @param allowImportingTsExtensions Generate .ts extentions on imports enstead .js
 */
export const writeClientFactories = async (
    services: Service[],
    templates: Templates,
    outputPath: string,
    indent: Indent,
    allowImportingTsExtensions: boolean
): Promise<void> => {
    const extension = 'ts';
    const resolvers = [
        {
            name: 'types',
            template: templates.exports.factories.types,
            context: { services, allowImportingTsExtensions },
        },
    ];
    const index = [
        {
            name: 'index',
            template: templates.exports.factories.index,
            context: { resolvers, extension, allowImportingTsExtensions },
        },
    ];

    for (const file of [...resolvers, ...index]) {
        const fileServer = resolve(outputPath, `${file.name}.${extension}`);
        const templateResult = file.template(file.context);
        await writeFile(fileServer, i(f(templateResult), indent));
    }
};
