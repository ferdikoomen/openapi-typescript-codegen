import { OpenApi } from '../interfaces/OpenApi';

type Props = Pick<OpenApi, 'schemes' | 'host' | 'basePath'>;

export function getServer(openApi: Props): string {
    const scheme = (openApi.schemes && openApi.schemes[0]) || 'http';
    const host = openApi.host;
    const basePath = openApi.basePath || '';
    return host ? `${scheme}://${host}${basePath}` : basePath;
}
