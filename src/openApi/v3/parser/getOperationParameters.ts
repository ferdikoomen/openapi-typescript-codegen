import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OpenApi } from '../interfaces/OpenApi';
import { getRef } from './getRef';
import { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { getOperationParameter } from './getOperationParameter';

function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    return a.isRequired && !b.isRequired ? -1 : !a.isRequired && b.isRequired ? 1 : 0;
}

export function getOperationParameters(openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters {
    const operationParameters: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
        parametersBody: null,
    };

    // Iterate over the parameters
    parameters.forEach(parameter => {
        const paramRef = getRef<OpenApiParameter>(openApi, parameter);
        const param = getOperationParameter(openApi, paramRef);

        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (param.prop !== 'api-version') {
            switch (parameter.in) {
                case 'path':
                    operationParameters.parametersPath.push(param);
                    operationParameters.parameters.push(param);
                    operationParameters.imports.push(...param.imports);
                    break;

                case 'query':
                    operationParameters.parametersQuery.push(param);
                    operationParameters.parameters.push(param);
                    operationParameters.imports.push(...param.imports);
                    break;

                case 'header':
                    operationParameters.parametersHeader.push(param);
                    operationParameters.parameters.push(param);
                    operationParameters.imports.push(...param.imports);
                    break;
            }
        }
    });

    operationParameters.parameters = operationParameters.parameters.sort(sortByRequired);
    operationParameters.parametersPath = operationParameters.parametersPath.sort(sortByRequired);
    operationParameters.parametersQuery = operationParameters.parametersQuery.sort(sortByRequired);
    operationParameters.parametersForm = operationParameters.parametersForm.sort(sortByRequired);
    operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired);
    return operationParameters;
}
