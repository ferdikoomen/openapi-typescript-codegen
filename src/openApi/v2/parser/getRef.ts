import * as path from 'path';
import * as fs from 'fs';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiReference } from '../interfaces/OpenApiReference';

function retrieveFile(projectPath: string, filePath: string) {
    const normalised = path.normalize(filePath);
    if (!normalised.startsWith(projectPath)) {
        throw new Error(`$ref resolved path ${normalised} outside project directory ${projectPath}`);
    }
    try {
        const fileContents = fs.readFileSync(normalised);
        const fileString = fileContents.toString('utf8');
        return JSON.parse(fileString);
    } catch (error) {
        throw new Error(`Unable to read referenced file ${normalised}: ${error.message}`);
    }
}

function getRelativeReference<T>(openApi: OpenApi, ref: string): T {
    // Fetch the paths to the definitions, this converts:
    // "#/components/schemas/Form" to ["components", "schemas", "Form"]
    const paths = ref
        .replace(/^#/g, '')
        .split('/')
        .filter(item => item);

    // Try to find the reference by walking down the path,
    // if we cannot find it, then we throw an error.
    let result: any = openApi;
    paths.forEach((path: string): void => {
        if (result.hasOwnProperty(path)) {
            result = result[path];
        } else {
            throw new Error(`Could not find reference: "${ref}"`);
        }
    });
    return result as T;
}
export function getRef<T>(openApi: OpenApi, item: T & OpenApiReference): T {
    if (item.$ref) {
        if (item.$ref.startsWith('#')) {
            // relative file reference
            return getRelativeReference(openApi, item.$ref);
        } else {
            // URI reference - could be filesystem or remote
            const uri = new URL(item.$ref, openApi.$meta.baseUri);
            if (uri.protocol === 'file') {
                const resolvedItem = retrieveFile(uri.pathname, openApi.$meta.projectPath);
                return resolvedItem as T;
            } else {
                throw new Error(`Cannot retrieve $ref item.$ref for protocol "${uri.protocol}"`);
            }
        }
    }
    return item as T;
}
