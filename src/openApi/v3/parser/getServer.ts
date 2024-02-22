import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiServer } from '../interfaces/OpenApiServer';
import type { OpenApiPath } from '../interfaces/OpenApiPath';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';

export const getServerUrl = (server?: OpenApiServer): string | undefined => {
    if (!server) return undefined;

    const variables = server.variables || {};
    let url = server.url || '';
    for (const variable in variables) {
        if (variables.hasOwnProperty(variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url.replace(/\/$/g, '');
};

export const getServer = (openApi: OpenApi): string => getServerUrl(openApi.servers?.[0]) ?? '';
export const getPathItemServer = (pathItem: OpenApiPath): string | undefined => getServerUrl(pathItem.servers?.[0]);
export const getOperationServer = (operation: OpenApiOperation): string | undefined =>
    getServerUrl(operation.servers?.[0]);
