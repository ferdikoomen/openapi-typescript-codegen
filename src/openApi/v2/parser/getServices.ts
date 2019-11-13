import { Service } from '../../../client/interfaces/Service';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiPath } from '../interfaces/OpenApiPath';
import { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperation } from './getOperation';
import { Operation } from '../../../client/interfaces/Operation';

/**
 * Get the OpenAPI services
 */
export function getServices(openApi: OpenApi): Map<string, Service> {
    const services: Map<string, Service> = new Map<string, Service>();

    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            const path: OpenApiPath = openApi.paths[url];
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    // Check supported methods
                    switch (method) {
                        case 'get':
                        case 'put':
                        case 'post':
                        case 'delete':
                        case 'options':
                        case 'head':
                        case 'patch':
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op: OpenApiOperation = path[method]!;
                            const operation: Operation = getOperation(openApi, url, method, op);

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
    return services;
}
