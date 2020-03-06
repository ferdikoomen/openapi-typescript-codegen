import { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { getOperationParameter } from './getOperationParameter';
import { getRef } from './getRef';
import { sortByRequired } from './sortByRequired';

export function getOperationParameters(openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters {
    const operationParameters: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null,
    };

    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameter = getRef<OpenApiParameter>(openApi, parameterOrReference);
        const param = getOperationParameter(openApi, parameter);

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

                case 'formData':
                    operationParameters.parametersForm.push(param);
                    operationParameters.parameters.push(param);
                    operationParameters.imports.push(...param.imports);
                    break;

                case 'cookie':
                    operationParameters.parametersCookie.push(param);
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
    operationParameters.parametersCookie = operationParameters.parametersCookie.sort(sortByRequired);
    operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired);
    return operationParameters;
}
