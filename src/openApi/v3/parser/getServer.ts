import { OpenApi } from '../interfaces/OpenApi';

type Props = Pick<OpenApi, 'servers'>;

export function getServer(openApi: Props): string {
    const server = openApi.servers && openApi.servers[0];
    const variables = (server && server.variables) || {};
    let url = (server && server.url) || '';
    Object.entries(variables).forEach(variable => {
        url = url.replace(`{${variable[0]}}`, variable[1].default);
    });
    return url;
}
