import type { OpenApi } from '../interfaces/OpenApi';

export const getServer = (openApi: OpenApi): string => {
    const server = openApi.servers?.[0];
    const variables = server?.variables || {};
    let url = server?.url || '';
    for (const variable in variables) {
        if (Object.prototype.hasOwnProperty.call(variables, variable)) {
            url = url.replace(`{${variable}}`, variables[variable].default);
        }
    }
    return url.replace(/\/$/g, '');
};
