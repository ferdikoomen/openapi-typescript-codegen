import * as path from 'path';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiReference } from '../interfaces/OpenApiReference';
import { getOpenApiSpec } from '../../../utils/getOpenApiSpec';

async function retrieveFile(filePath: string, projectPath: string) {
    const normalised = path.normalize(filePath);
    if (!normalised.startsWith(projectPath)) {
        throw new Error(`$ref resolved path ${normalised} outside project directory ${projectPath}`);
    }
    try {
        return await getOpenApiSpec(normalised);
    } catch (error) {
        throw new Error(`Unable to read referenced file ${normalised}: ${error.message}`)
    }
}

function getRelativeReference<T>(openApi: OpenApi, ref: string): T {
    // Fetch the paths to the definitions, this converts:
    // "#/components/schemas/Form" to ["components", "schemas", "Form"]
    const paths = ref.replace(/^#/g, '')
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
export async function getRef<T>(openApi: OpenApi, item: T & OpenApiReference): Promise<T> {
    if (item.$ref) {
        if (item.$ref.startsWith('#')) {
            // relative file reference
            return Promise.resolve(getRelativeReference(openApi, item.$ref));
        } else {
            // URI reference - could be filesystem or remote
            const uri = new URL(item.$ref, openApi.$meta.baseUri);
            if (uri.protocol === 'file:') {
                const resolvedItem = await retrieveFile(uri.pathname, openApi.$meta.projectPath);
                return Promise.resolve(resolvedItem as T);
            } else {
                throw new Error(`Cannot retrieve $ref item.$ref for protocol "${uri.protocol}"`);
            }
        }
    }
    return Promise.resolve(item as T);
}
