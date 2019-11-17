import { Service } from '../../../client/interfaces/Service';
import { getServiceClassName } from './getServiceClassName';
import { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationName } from './getOperationName';
import { getOperationPath } from './getOperationPath';
import { getOperationParameters } from './getOperationParameters';
import { OpenApi } from '../interfaces/OpenApi';
import { getComment } from './getComment';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResponse } from './getOperationResponse';
import { getOperationErrors } from './getOperationErrors';
import { Operation } from '../../../client/interfaces/Operation';
import { PrimaryType } from './constants';

export function getOperation(openApi: OpenApi, url: string, method: string, op: OpenApiOperation): Operation {
    const serviceName = (op.tags && op.tags[0]) || 'Service';
    const serviceClassName = getServiceClassName(serviceName);
    const operationNameFallback = `${method}${serviceClassName}`;
    const operationName = getOperationName(op.operationId || operationNameFallback);
    const operationPath = getOperationPath(url);

    // Create a new operation object for this method.
    const result: Operation = {
        service: serviceClassName,
        name: operationName,
        summary: getComment(op.summary),
        description: getComment(op.description),
        deprecated: op.deprecated || false,
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
        result: PrimaryType.VOID,
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(openApi, op.parameters);
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
        const responses = getOperationResponses(openApi, op.responses);
        const response = getOperationResponse(responses);
        const errors = getOperationErrors(responses);
        result.imports.push(...response.imports);
        result.errors = errors;
        result.result = response.type;
    }

    return result;
}
