import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

/**
 * Check if given file exists and try to read the content as string.
 * @param filePath
 */
function read(filePath: string): string {
    if (fs.existsSync(filePath)) {
        try {
            return fs.readFileSync(filePath, 'utf8').toString();
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
export function getOpenApiSpec(input: string): any {
    const file = path.resolve(process.cwd(), input);
    const extname = path.extname(file).toLowerCase();
    const content = read(file);
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
