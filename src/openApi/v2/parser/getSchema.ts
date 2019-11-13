import { OpenApi } from '../interfaces/OpenApi';
import { Schema } from '../../../client/interfaces/Schema';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getType } from './getType';
import { getComment } from './getComment';
import { Type } from '../../../client/interfaces/Type';
import { getEnumType } from './getEnumType';
import { getEnumTypeFromDescription } from './getEnumTypeFromDescription';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { SchemaReference } from '../../../client/interfaces/SchemaReference';
import { getSchemaReference } from './getSchemaReference';
import { SchemaProperty } from '../../../client/interfaces/SchemaProperty';
import { getSchemaProperty } from './getSchemaProperty';

// TODO: I think we can convert this into getModel and getModelProperties
// but we need to think about what will happen when a simple type is used as a model
// needs a test case
export function getSchema(openApi: OpenApi, schema: OpenApiSchema): Schema {
    const result: Schema = {
        type: 'any',
        base: 'any',
        template: null,
        description: getComment(schema.description),
        default: schema.default, // TODO: Unused?
        required: false, // TODO: Unused?
        nullable: false, // TODO: Unused?
        readOnly: schema.readOnly || false, // TODO: Unused?
        extends: [],
        imports: [],
        properties: new Map<string, SchemaProperty>(),
    };

    // If the schema has a type than it can be a basic or generic type.
    if (schema.type) {
        const schemaType: Type = getType(schema.type);
        result.type = schemaType.type;
        result.base = schemaType.base;
        result.template = schemaType.template;
        result.imports.push(...schemaType.imports);

        // If the schema is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (schema.type === 'array' && schema.items) {
            const arrayType: SchemaReference = getSchemaReference(openApi, schema.items);
            result.type = `${arrayType.type}[]`;
            result.base = arrayType.base;
            result.template = arrayType.template;
            result.imports.push(...arrayType.imports);
        }
    }

    // If the param is a enum then return the values as an inline type.
    if (schema.enum) {
        result.type = getEnumType(schema.enum);
        result.base = 'string';
        result.imports = [];
    }

    // Check if this could be a special enum where values are documented in the description.
    if (schema.description && schema.type === 'int') {
        const enumType: string | null = getEnumTypeFromDescription(schema.description);
        if (enumType) {
            result.type = enumType;
            result.base = 'number';
            result.imports = [];
        }
    }

    // Check if this model extends other models
    if (schema.allOf) {
        schema.allOf.forEach((parent: OpenApiSchema & OpenApiReference): void => {
            const parentSchema: SchemaReference = getSchemaReference(openApi, parent);
            result.extends.push(parentSchema.type);
            result.imports.push(parentSchema.base);

            // Merge properties of other models
            if (parent.properties) {
                for (const propertyName in schema.properties) {
                    if (schema.properties.hasOwnProperty(propertyName)) {
                        const propertyRef: OpenApiSchema & OpenApiReference = schema.properties[propertyName];
                        const propertyRequired: boolean = (schema.required && schema.required.includes(propertyName)) || false;
                        const property: SchemaProperty = getSchemaProperty(openApi, propertyRef, propertyName, propertyRequired);
                        result.imports.push(...property.imports);
                        result.properties.set(propertyName, property);
                    }
                }
            }
        });
    }

    for (const propertyName in schema.properties) {
        if (schema.properties.hasOwnProperty(propertyName)) {
            const propertyRef: OpenApiSchema & OpenApiReference = schema.properties[propertyName];
            const propertyRequired: boolean = (schema.required && schema.required.includes(propertyName)) || false;
            const property: SchemaProperty = getSchemaProperty(openApi, propertyRef, propertyName, propertyRequired);
            result.imports.push(...property.imports);
            result.properties.set(propertyName, property);
        }
    }

    return result;
}
