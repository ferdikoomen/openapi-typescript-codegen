import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiServer } from '../interfaces/OpenApiServer';
import { Dictionary } from '../../../utils/types';
import { OpenApiServerVariable } from '../interfaces/OpenApiServerVariable';

export function getServer(openApi: OpenApi): string {
    const server: OpenApiServer | undefined = openApi.servers && openApi.servers[0];
    const variables: Dictionary<OpenApiServerVariable> = (server && server.variables) || {};
    let url: string = (server && server.url) || '';
    for (const variable in variables) {
        if (variables.hasOwnProperty(variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url;
}
