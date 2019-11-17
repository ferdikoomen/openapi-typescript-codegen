import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OpenApi } from '../interfaces/OpenApi';
import { getRef } from './getRef';
import { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { getOperationParameter } from './getOperationParameter';

function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    return a.required && !b.required ? -1 : !a.required && b.required ? 1 : 0;
}

export function getOperationParameters(openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters {
    const result: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
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
                    result.parametersPath.push(param);
                    result.parameters.push(param);
                    result.imports.push(...param.imports);
                    break;

                case 'query':
                    result.parametersQuery.push(param);
                    result.parameters.push(param);
                    result.imports.push(...param.imports);
                    break;

                case 'header':
                    result.parametersHeader.push(param);
                    result.parameters.push(param);
                    result.imports.push(...param.imports);
                    break;

                case 'formData':
                    result.parametersForm.push(param);
                    result.parameters.push(param);
                    result.imports.push(...param.imports);
                    break;

                case 'body':
                    result.parametersBody = param;
                    result.parameters.push(param);
                    result.imports.push(...param.imports);
                    break;
            }
        }
    });

    result.parameters = result.parameters.sort(sortByRequired);
    result.parametersPath = result.parametersPath.sort(sortByRequired);
    result.parametersQuery = result.parametersQuery.sort(sortByRequired);
    result.parametersForm = result.parametersForm.sort(sortByRequired);
    result.parametersHeader = result.parametersHeader.sort(sortByRequired);
    return result;
}
