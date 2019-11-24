import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
import { getModel } from './getModel';
import { getOperationParameterName } from './getOperationParameterName';
import { getType } from './getType';

export function getOperationParameter(openApi: OpenApi, parameter: OpenApiParameter): OperationParameter {
    const operationParameter: OperationParameter = {
        in: parameter.in,
        prop: parameter.name,
        export: 'interface',
        name: getOperationParameterName(parameter.name),
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(parameter.description),
        default: undefined,
        isProperty: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (parameter.$ref) {
        const definitionRef = getType(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        return operationParameter;
    }

    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const model = getType(parameter.schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            return operationParameter;
        } else {
            const model = getModel(openApi, parameter.schema);
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.imports.push(...model.imports);
            operationParameter.extends.push(...model.extends);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            return operationParameter;
        }
    }

    return operationParameter;
}
