import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OpenApi } from '../interfaces/OpenApi';
import { getComment } from './getComment';
import { getOperationParameterName } from './getOperationParameterName';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { PrimaryType } from './constants';

export function getOperationParameter(openApi: OpenApi, parameter: OpenApiParameter): OperationParameter {
    const result: OperationParameter = {
        in: parameter.in,
        prop: parameter.name,
        name: getOperationParameterName(parameter.name),
        export: 'interface',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(parameter.description),
        readOnly: false,
        required: false,
        nullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
        default: null,
    };
    return result;
}
