import { OpenApi } from '../interfaces/OpenApi';

/**
 * Get the base server url.
 * @param openApi
 */
export function getServer(openApi: OpenApi): string {
    const scheme: string = (openApi.schemes && openApi.schemes[0]) || 'http';
    const host: string | undefined = openApi.host;
    const basePath: string = openApi.basePath || '';
    return host ? `${scheme}://${host}${basePath}` : basePath;
}
