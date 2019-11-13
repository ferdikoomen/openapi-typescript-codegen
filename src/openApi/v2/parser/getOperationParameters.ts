import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { Parameter } from '../../../client/interfaces/Parameter';
import { getParameter } from './getParameter';
import { OpenApi } from '../interfaces/OpenApi';
import { getRef } from './getRef';

function sortByRequired(a: Parameter, b: Parameter): number {
    return a.required && !b.required ? -1 : !a.required && b.required ? 1 : 0;
}

export function getOperationParameters(openApi: OpenApi, parametersOrReferences: (OpenApiParameter & OpenApiReference)[]): OperationParameters {
    const result: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
        parametersBody: null,
    };

    // Iterate over the parameters
    parametersOrReferences.forEach(parameterOrReference => {
        const parameter: OpenApiParameter = getRef<OpenApiParameter>(openApi, parameterOrReference);
        const param: Parameter = getParameter(openApi, parameter);

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
