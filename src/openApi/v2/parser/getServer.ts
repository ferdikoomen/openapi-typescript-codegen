import type { OpenApi } from '../interfaces/OpenApi';

/**
 * Get the base server url.
 * @param openApi
 */
export function getServer(openApi: OpenApi): string {
    const scheme = (openApi.schemes && openApi.schemes[0]) || 'http';
    const host = openApi.host;
    const basePath = openApi.basePath || '';
    return host ? `${scheme}://${host}${basePath}` : basePath;
}
