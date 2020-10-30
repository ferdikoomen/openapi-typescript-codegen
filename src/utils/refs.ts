import * as path from 'path';
import { ParserMeta } from '../interfaces/ParserMeta';
import { OpenApiBase } from '../interfaces/OpenApiBase';
import { getOpenApiSpec } from './getOpenApiSpec';

export type JSONReference = {
    $ref?: string;
};

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

export function getRelativeReference<T>(openApi: OpenApiBase, ref: string): T {
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
export async function getExternalReference<T>($meta: ParserMeta, ref: string): Promise<T> {
    const uri = new URL(ref, $meta.baseUri);
    if (uri.protocol === 'file:') {
        const resolvedItem = await retrieveFile(uri.pathname, $meta.projectPath);
        return Promise.resolve(resolvedItem as T);
    } else {
        throw new Error(`Cannot retrieve $ref ${ref} for protocol "${uri.protocol}"`);
    }
}

export function isLocalRef(ref: string) { return ref.startsWith('#'); }

export async function getRef<T>(openApi: OpenApiBase, item: T & JSONReference): Promise<T> {
    if (item.$ref) {
        if (isLocalRef(item.$ref)) {
            // relative file reference
            return Promise.resolve(getRelativeReference(openApi, item.$ref));
        } else {
            // URI reference - could be filesystem or remote
            return getExternalReference(openApi.$meta, item.$ref);
        }
    }
    return Promise.resolve(item as T);
}
