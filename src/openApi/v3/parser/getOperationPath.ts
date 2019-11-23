/**
 * Get the final service path, this replaces the "{api-version}" placeholder
 * with a new template string placeholder so we can dynamically inject the
 * OpenAPI version without the need to hardcode this in the URL.
 * @param path
 */
export function getOperationPath(path: string): string {
    return path.replace(/{api-version}/g, '{OpenAPI.VERSION}').replace(/\{(.*?)\}/g, '${$1}');
}
