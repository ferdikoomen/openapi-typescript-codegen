import type { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';

export const getOperationParameterDefault = (
    parameter: OpenApiParameter,
    operationParameter: OperationParameter
): string | undefined => {
    if (parameter.default === undefined) {
        return undefined;
    }

    if (parameter.default === null) {
        return 'null';
    }

    const type = parameter.type || typeof parameter.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number': {
            const paramDefault = parameter.default as number;
            if (operationParameter.export === 'enum' && operationParameter.enum[paramDefault]) {
                return operationParameter.enum[paramDefault].value;
            }
            return paramDefault.toString();
        }

        case 'boolean':
            return JSON.stringify(parameter.default);

        case 'string':
            return `'${parameter.default}'`;

        case 'object':
            try {
                return JSON.stringify(parameter.default, null, 4);
            } catch (e) {
                // Ignore
            }
    }

    return undefined;
};
