import { Service } from '../../../client/interfaces/Service';
import { OpenApi } from '../interfaces/OpenApi';

/**
 * Parse and return the OpenAPI services.
 * @param openApi
 */
export function getServices(openApi: OpenApi): Map<string, Service> {
    const services = new Map<string, Service>();
    const paths = openApi.paths;
    for (const url in paths) {
        if (paths.hasOwnProperty(url)) {
            const path = paths[url];
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    switch (method) {
                        case 'get':
                        case 'put':
                        case 'post':
                        case 'delete':
                        case 'options':
                        case 'head':
                        case 'patch':
                            const op = path[method];
                            if (op) {
                                //
                            }
                            break;
                    }
                }
            }
        }
    }
    return services;
}
