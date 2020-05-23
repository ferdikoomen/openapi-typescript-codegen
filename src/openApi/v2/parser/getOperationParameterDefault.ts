import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { OpenApiParameter } from '../interfaces/OpenApiParameter';

export function getOperationParameterDefault(parameter: OpenApiParameter, operationParameter: OperationParameter): string | undefined {
    if (parameter.default === null) {
        return 'null';
    }

    switch (typeof parameter.default) {
        case 'number':
            if (operationParameter.export == 'enum' && operationParameter.enum.length && operationParameter.enum[parameter.default]) {
                return operationParameter.enum[parameter.default].value;
            }
            return JSON.stringify(parameter.default);

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

    return;
}
