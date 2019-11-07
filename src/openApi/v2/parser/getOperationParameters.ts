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
    const imports: string[] = [];
    const parameters: Parameter[] = [];
    const parametersPath: Parameter[] = [];
    const parametersQuery: Parameter[] = [];
    const parametersForm: Parameter[] = [];
    const parametersHeader: Parameter[] = [];
    let parametersBody: Parameter | null = null;

    // Iterate over the parameters
    for (let i = 0, n = parametersOrReferences.length; i < n; i++) {
        const parameterOrReference: OpenApiParameter & OpenApiReference = parametersOrReferences[i];
        const parameter: OpenApiParameter = getRef<OpenApiParameter>(openApi, parameterOrReference);
        const param: Parameter = getParameter(openApi, parameter);

        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (param.prop !== 'api-version') {
            switch (parameter.in) {
                case 'path':
                    parametersPath.push(param);
                    parameters.push(param);
                    imports.push(...param.imports);
                    break;

                case 'query':
                    parametersQuery.push(param);
                    parameters.push(param);
                    imports.push(...param.imports);
                    break;

                case 'header':
                    parametersHeader.push(param);
                    parameters.push(param);
                    imports.push(...param.imports);
                    break;

                case 'formData':
                    parametersForm.push(param);
                    parameters.push(param);
                    imports.push(...param.imports);
                    break;

                case 'body':
                    parametersBody = param;
                    parameters.push(param);
                    imports.push(...param.imports);
                    break;
            }
        }
    }

    return {
        imports,
        parameters: parameters.sort(sortByRequired),
        parametersPath: parametersPath.sort(sortByRequired),
        parametersQuery: parametersQuery.sort(sortByRequired),
        parametersForm: parametersForm.sort(sortByRequired),
        parametersHeader: parametersHeader.sort(sortByRequired),
        parametersBody: parametersBody,
    };
}
