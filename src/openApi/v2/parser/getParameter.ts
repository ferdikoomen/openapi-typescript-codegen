import { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { getType } from './getType';
import { Parameter } from '../../../client/interfaces/Parameter';
import { Type } from '../../../client/interfaces/Type';
import { OpenApi } from '../interfaces/OpenApi';
import { getParameterName } from './getParameterName';
import { getArrayType } from './getArrayType';
import { ArrayType } from '../../../client/interfaces/ArrayType';
import { getEnumType } from './getEnumType';
import { getEnumTypeFromDescription } from './getEnumTypeFromDescription';
import { getComment } from './getComment';

export function getParameter(openApi: OpenApi, parameter: OpenApiParameter): Parameter {
    let parameterType = 'any';
    let parameterBase = 'any';
    let parameterTemplate: string | null = null;
    const parameterImports: string[] = [];

    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const parameterData: Type = getType(parameter.type);
        parameterType = parameterData.type;
        parameterBase = parameterData.base;
        parameterTemplate = parameterData.template;
        parameterImports.push(...parameterData.imports);

        // If the parameter is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (parameter.type === 'array' && parameter.items) {
            const arrayType: ArrayType = getArrayType(parameter.items);
            parameterType = `${arrayType.type}[]`;
            parameterBase = arrayType.base;
            parameterTemplate = arrayType.template;
            parameterImports.push(...arrayType.imports);
        }
    }

    // If this parameter has a schema, then we should treat it as an embedded parameter.
    // We can just parse the schema name ($ref) and use that as the parameter type.
    if (parameter.schema) {
        // TODO: console.log('parameter.schema', parameter.schema);
    }

    // If the param is a enum then return the values as an inline type.
    if (parameter.enum) {
        parameterType = getEnumType(parameter.enum);
        parameterBase = 'string';
    }

    // Check if this could be a special enum where values are documented in the description.
    if (parameter.description && parameter.type === 'int') {
        const enumType: string | null = getEnumTypeFromDescription(parameter.description);
        if (enumType) {
            parameterType = enumType;
            parameterBase = 'number';
        }
    }

    return {
        in: parameter.in,
        prop: parameter.name,
        name: getParameterName(parameter.name),
        type: parameterType,
        base: parameterBase,
        template: parameterTemplate,
        description: getComment(parameter.description),
        default: parameter.default,
        required: parameter.required || false,
        nullable: false,
        imports: parameterImports,
    };
}
