import { Method } from './constants';
import { OpenApi } from '../interfaces/OpenApi';
import { Service } from '../../../client/interfaces/Service';
import { getOperation } from './getOperation';

/**
 * Get the OpenAPI services
 */
export function getServices(openApi: OpenApi): Service[] {
    const services = new Map<string, Service>();
    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            const path = openApi.paths[url];
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    switch (method) {
                        case Method.GET:
                        case Method.PUT:
                        case Method.POST:
                        case Method.DELETE:
                        case Method.OPTIONS:
                        case Method.HEAD:
                        case Method.PATCH:
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method]!;
                            const operation = getOperation(openApi, url, method, op);

                            // If we have already declared a service, then we should fetch that and
                            // append the new method to it. Otherwise we should create a new service object.
                            const service =
                                services.get(operation.service) ||
                                ({
                                    name: operation.service,
                                    operations: [],
                                    imports: [],
                                } as Service);

                            // Push the operation in the service
                            service.operations.push(operation);
                            service.imports.push(...operation.imports);
                            services.set(operation.service, service);
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
}
