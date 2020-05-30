import * as yaml from 'js-yaml';
import * as path from 'path';

import { exists, readFile } from './fileSystem';

/**
 * Check if given file exists and try to read the content as string.
 * @param filePath
 */
async function read(filePath: string): Promise<string> {
    const fileExists = await exists(filePath);
    if (fileExists) {
        try {
            const content = await readFile(filePath, 'utf8');
            return content.toString();
        } catch (e) {
            throw new Error(`Could not read OpenApi spec: "${filePath}"`);
        }
    }
    throw new Error(`Could not find OpenApi spec: "${filePath}"`);
}

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param input
 */
export async function getOpenApiSpec(input: string): Promise<any> {
    const file = path.resolve(process.cwd(), input);
    const extname = path.extname(file).toLowerCase();
    const content = await read(file);
    switch (extname) {
        case '.yml':
        case '.yaml':
            try {
                return yaml.safeLoad(content);
            } catch (e) {
                throw new Error(`Could not parse OpenApi YAML: "${file}"`);
            }

        default:
            try {
                return JSON.parse(content);
            } catch (e) {
                throw new Error(`Could not parse OpenApi JSON: "${file}"`);
            }
    }
}
