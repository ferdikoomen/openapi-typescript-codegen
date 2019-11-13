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
    const serviceName: string = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName: string = getServiceClassName(serviceName);
    const operationNameFallback: string = `${method}${serviceClassName}`;
    const operationName: string = getOperationName(op.operationId || operationNameFallback);
    const operationPath: string = getOperationPath(url);

    // Create a new operation object for this method.
    const result: Operation = {
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
        result.imports.push(...parameters.imports);
        result.parameters.push(...parameters.parameters);
        result.parametersPath.push(...parameters.parametersPath);
        result.parametersQuery.push(...parameters.parametersQuery);
        result.parametersForm.push(...parameters.parametersForm);
        result.parametersHeader.push(...parameters.parametersHeader);
        result.parametersBody = parameters.parametersBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const responses: OperationResponse[] = getOperationResponses(openApi, op.responses);
        const response: OperationResponse = getOperationResponse(responses);
        const errors: OperationError[] = getOperationErrors(responses);
        result.imports.push(...response.imports);
        result.errors = errors;
        result.result = response.type;
    }

    return result;
}
