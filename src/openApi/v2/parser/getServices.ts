import { Service } from '../../../client/interfaces/Service';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getServiceClassName } from './getServiceClassName';
import { getServiceOperationName } from './getServiceOperationName';
import { getServiceOperationPath } from './getServiceOperationPath';
import { ServiceOperation } from '../../../client/interfaces/ServiceOperation';
import { getServiceOperationResponses } from './getServiceOperationResponses';
import { getServiceOperationResult } from './getServiceOperationResult';
import { getServiceOperationErrors } from './getServiceOperationErrors';

function getMethod(url: string, services: Map<string, Service>, op: OpenApiOperation, method: string): void {
    const serviceName = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName: string = getServiceClassName(serviceName);
    const serviceOperationNameFallback = `${method}${serviceClassName}`;
    const serviceOperationName: string = getServiceOperationName(op.operationId || serviceOperationNameFallback);
    const servicePath: string = getServiceOperationPath(url);

    // If we have already declared a service, then we should fetch that and
    // append the new method to it. Otherwise we should create a new service object.
    const service =
        services.get(serviceClassName) ||
        ({
            name: serviceClassName,
            imports: [],
            operations: [],
        } as Service);

    // Create a new operation object for this method.
    const operation: ServiceOperation = {
        name: serviceOperationName,
        summary: op.summary,
        description: op.description,
        deprecated: op.deprecated,
        method: method,
        path: servicePath,
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
        parametersBody: null,
        models: [],
        errors: [],
        response: null,
        result: 'any',
    };

    if (op.responses) {
        const responses = getServiceOperationResponses(op.responses);
        const result = getServiceOperationResult(responses);
        operation.errors = getServiceOperationErrors(responses);
        operation.result = result.type;
        service.imports.push(...result.imports);
    }

    service.operations.push(operation);
    services.set(serviceClassName, service);
}

/**
 * Parse and return the OpenAPI services.
 * @param openApi
 */
export function getServices(openApi: OpenApi): Map<string, Service> {
    const services = new Map<string, Service>();
    Object.keys(openApi.paths).forEach(url => {
        const path = openApi.paths[url];
        path.get && getMethod(url, services, path.get, 'get');
        path.put && getMethod(url, services, path.put, 'put');
        path.post && getMethod(url, services, path.post, 'post');
        path.delete && getMethod(url, services, path.delete, 'delete');
        path.options && getMethod(url, services, path.options, 'options');
        path.head && getMethod(url, services, path.head, 'head');
        path.patch && getMethod(url, services, path.patch, 'patch');
    });
    return services;
}
