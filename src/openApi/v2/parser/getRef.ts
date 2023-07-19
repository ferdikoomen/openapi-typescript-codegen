import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiReference } from '../interfaces/OpenApiReference';

const ESCAPED_REF_SLASH = /~1/g;
const ESCAPED_REF_TILDE = /~0/g;

export const getRef = <T>(openApi: OpenApi, item: T & OpenApiReference): T => {
    if (item.$ref) {
        // Fetch the paths to the definitions, this converts:
        // "#/definitions/Form" to ["definitions", "Form"]
        const paths = item.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(i => i);

        // Try to find the reference by walking down the path,
        // if we cannot find it, then we throw an error.
        let result = openApi;
        paths.forEach(path => {
            const decodedPath = decodeURIComponent(
                path.replace(ESCAPED_REF_SLASH, '/').replace(ESCAPED_REF_TILDE, '~')
            );
            if (result.hasOwnProperty(decodedPath)) {
                // @ts-ignore
                result = result[decodedPath];
            } else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result as T;
    }
    return item as T;
};
