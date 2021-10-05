import { load } from 'js-yaml';
import RefParser from 'json-schema-ref-parser';
import { extname } from 'path';

import { readSpec } from './readSpec';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(input: string): Promise<any> {
    const extension = extname(input).toLowerCase();
    const content = await readSpec(input);
    switch (extension) {
        case '.yml':
        case '.yaml':
            try {
                load(content);
            } catch (e) {
                throw new Error(`Could not parse OpenApi YAML: "${input}"`);
            }
            break;

        default:
            try {
                JSON.parse(content);
            } catch (e) {
                console.log(e);
                throw new Error(`Could not parse OpenApi JSON: "${input}"`);
            }
            break;
    }
    return await RefParser.bundle(input);
}
