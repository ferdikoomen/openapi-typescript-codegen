import * as yaml from 'js-yaml';
import * as path from 'path';

import { readSpec } from './readSpec';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(input: string): Promise<any> {
    const extname = path.extname(input).toLowerCase();
    const content = await readSpec(input);
    switch (extname) {
        case '.yml':
        case '.yaml':
            try {
                return yaml.safeLoad(content);
            } catch (e) {
                throw new Error(`Could not parse OpenApi YAML: "${input}"`);
            }

        default:
            try {
                return JSON.parse(content);
            } catch (e) {
                throw new Error(`Could not parse OpenApi JSON: "${input}"`);
            }
    }
}
