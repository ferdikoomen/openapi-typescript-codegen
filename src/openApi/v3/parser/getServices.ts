import type { Service } from '../../../client/interfaces/Service';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiPath } from '../interfaces/OpenApiPath';
import { getOperation } from './getOperation';
import { getOperationParameters } from './getOperationParameters';
import { getRef } from './getRef';

/**
 * Get the OpenAPI services
 */
export async function getServices(openApi: OpenApi): Promise<Service[]> {
    const services = new Map<string, Service>();
    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            // Grab path and parse any global path parameters
            const path = await getRef<OpenApiPath>(openApi, openApi.paths[url]);
            const pathParams = await getOperationParameters(openApi, path.parameters || []);

            // Parse all the methods for this path
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
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method]!;
                            const operation = await getOperation(openApi, url, method, op, pathParams);

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
