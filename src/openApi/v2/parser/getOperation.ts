import { Service } from '../../../client/interfaces/Service';
import { getServiceClassName } from './getServiceClassName';
import { Operation } from '../../../client/interfaces/Operation';
import { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationName } from './getOperationName';
import { getOperationPath } from './getOperationPath';
import { getOperationParameters } from './getOperationParameters';
import { OpenApi } from '../interfaces/OpenApi';
import { getComment } from './getComment';
import { getOperationResponses } from './getOperationResponses';
import { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { getOperationResponse } from './getOperationResponse';
import { getOperationErrors } from './getOperationErrors';
import { OperationError } from '../../../client/interfaces/OperationError';

export function getOperation(openApi: OpenApi, url: string, method: string, op: OpenApiOperation): Operation {
    const serviceName = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName = getServiceClassName(serviceName);
    const operationNameFallback = `${method}${serviceClassName}`;
    const operationName = getOperationName(op.operationId || operationNameFallback);
    const operationPath = getOperationPath(url);

    // Create a new operation object for this method.
    const operation: Operation = {
        service: serviceClassName,
        name: operationName,
        summary: getComment(op.summary),
        description: getComment(op.description),
        deprecated: op.deprecated,
        method: method,
        path: operationPath,
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
        parametersBody: null,
        imports: [],
        errors: [],
        result: 'void',
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters: OperationParameters = getOperationParameters(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersBody = parameters.parametersBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const responses: OperationResponse[] = getOperationResponses(openApi, op.responses);
        const response: OperationResponse = getOperationResponse(responses);
        const errors: OperationError[] = getOperationErrors(responses);
        operation.imports.push(...response.imports);
        operation.errors = errors;
        operation.result = response.type;

        console.log(operation.result);
    }

    return operation;
}
