import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
import { getEnum } from './getEnum';
import { getEnumFromDescription } from './getEnumFromDescription';
import { getEnumType } from './getEnumType';
import { getModel } from './getModel';
import { getOperationParameterDefault } from './getOperationParameterDefault';
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
        default: getOperationParameterDefault(parameter.default),
        isProperty: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: false,
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

    if (parameter.enum) {
        const enumerators = getEnum(parameter.enum);
        if (enumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = getEnumType(enumerators);
            operationParameter.base = PrimaryType.STRING;
            operationParameter.enum.push(...enumerators);
            return operationParameter;
        }
    }

    if ((parameter.type === 'int' || parameter.type === 'integer') && parameter.description) {
        const enumerators = getEnumFromDescription(parameter.description);
        if (enumerators.length) {
            operationParameter.export = 'enum';
            operationParameter.type = getEnumType(enumerators);
            operationParameter.base = PrimaryType.NUMBER;
            operationParameter.enum.push(...enumerators);
            return operationParameter;
        }
    }

    if (parameter.type === 'array' && parameter.items) {
        const items = getType(parameter.items.type);
        operationParameter.export = 'array';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        return operationParameter;
    }

    if (parameter.type === 'object' && parameter.items) {
        const items = getType(parameter.items.type);
        operationParameter.export = 'dictionary';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.imports.push('Dictionary');
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

    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = getType(parameter.type);
        operationParameter.export = 'generic';
        operationParameter.type = definitionType.type;
        operationParameter.base = definitionType.base;
        operationParameter.template = definitionType.template;
        operationParameter.imports.push(...definitionType.imports);
        return operationParameter;
    }

    return operationParameter;
}
