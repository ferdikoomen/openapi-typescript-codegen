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
import { getSchema } from './getSchema';
import { Schema } from '../../../client/interfaces/Schema';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';

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

    // If this parameter has a schema, then we need to check two things:
    // if this is a reference then the parameter is just the 'name' of
    // this reference type. Otherwise it might be a complex schema and
    // then we need to parse the schema!
    if (parameter.schema) {
        if (parameter.schema.$ref) {
            const schemaReference: Type = getType(parameter.schema.$ref);
            parameterType = schemaReference.type;
            parameterBase = schemaReference.base;
            parameterTemplate = schemaReference.template;
            parameterImports.push(...schemaReference.imports);
        } else {
            const schema: Schema = getSchema(openApi, parameter.schema as OpenApiSchema);
            parameterType = schema.type;
            parameterBase = schema.base;
            parameterTemplate = schema.template;
            parameterImports.push(...schema.imports);
        }
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
