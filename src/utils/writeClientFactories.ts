import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { writeFile } from './fileSystem';
import { formatCode as f } from './formatCode';
import { formatIndentation as i } from './formatIndentation';
import { Service } from '../client/interfaces/Service';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param indent Indentation options (4, 2 or tab)
 */
export const writeClientFactories = async (
    services: Service[],
    templates: Templates,
    outputPath: string,
    indent: Indent
): Promise<void> => {
    const extension = 'ts';
    const resolvers = [
        { name: 'types', template: templates.exports.factories.types, context: { services } },
        { name: 'createServerResolver', template: templates.exports.factories.serverResolver, context: {} },
        { name: 'createClientResolver', template: templates.exports.factories.clientResolver, context: {} },
        { name: 'createHook', template: templates.exports.factories.hook, context: {} },
    ];
    const index = [{ name: 'index', template: templates.exports.factories.index, context: { resolvers, extension } }];

    for (const file of [...resolvers, ...index]) {
        const fileServer = resolve(outputPath, `${file.name}.${extension}`);
        const templateResult = file.template(file.context);
        await writeFile(fileServer, i(f(templateResult), indent));
    }
};
