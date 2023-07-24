import type { Indent } from '../Indent';
import type { Templates } from './registerHandlebarTemplates';

import { resolve } from 'path';

import { writeFile } from './fileSystem';
import { formatCode as f } from './formatCode';
import { formatIndentation as i } from './formatIndentation';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param indent Indentation options (4, 2 or tab)
 */
export const writeClientUtil = async (templates: Templates, outputPath: string, indent: Indent): Promise<void> => {
    const file = resolve(outputPath, `createRequestParams.ts`);
    const templateResult = templates.util.createRequestParams({});
    await writeFile(file, i(f(templateResult), indent));
};
