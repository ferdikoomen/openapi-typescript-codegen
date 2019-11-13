import { OpenApi } from '../interfaces/OpenApi';
import { Schema } from '../../../client/interfaces/Schema';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getType } from './getType';
import { getComment } from './getComment';
import { Type } from '../../../client/interfaces/Type';
import { getEnumType } from './getEnumType';
import { getEnumTypeFromDescription } from './getEnumTypeFromDescription';
import { Dictionary } from '../../../utils/types';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getRef } from './getRef';

export function getSchema(openApi: OpenApi, schema: OpenApiSchema, required: boolean = false): Schema {
    /**
     format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
     title?: string;
     description?: string;
     default?: any;
     multipleOf?: number;
     maximum?: number;
     exclusiveMaximum?: boolean;
     minimum?: number;
     exclusiveMinimum?: boolean;
     maxLength?: number;
     minLength?: number;
     pattern?: string;
     maxItems?: number;
     minItems?: number;
     uniqueItems?: number;
     maxProperties?: number;
     minProperties?: number;
     required?: string[];
     enum?: string[];
     type?: string;
     items?: OpenApiSchema & OpenApiReference;
     allOf?: (OpenApiSchema & OpenApiReference)[];
     properties?: Dictionary<OpenApiSchema & OpenApiReference>;
     additionalProperties?: boolean | (OpenApiSchema & OpenApiReference);
     discriminator?: string;
     readOnly?: boolean;
     xml?: OpenApiXml;
     externalDocs?: OpenApiExternalDocs;
     example?: any;
     */

    // TODO: Does this need a name?
    const result: Schema = {
        type: 'any',
        base: 'any',
        template: null,
        description: getComment(schema.description),
        default: schema.default,
        required: required,
        nullable: false,
        readOnly: schema.readOnly || false,
        extends: [],
        imports: [],
        properties: {},
    };

    // If the schema has a type than it can be a basic or generic type.
    if (schema.type) {
        const schemaData: Type = getType(schema.type);
        result.type = schemaData.type;
        result.base = schemaData.base;
        result.template = schemaData.template;
        result.imports.push(...schemaData.imports);

        // If the schema is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (schema.type === 'array' && schema.items) {
            const itemsOrReference: OpenApiSchema & OpenApiReference = schema.items;
            const items: OpenApiSchema = getRef<OpenApiSchema>(openApi, itemsOrReference);
            const itemsSchema: Schema = getSchema(openApi, items);
            result.type = `${itemsSchema.type}[]`;
            result.base = itemsSchema.base;
            result.template = itemsSchema.template;
            result.imports.push(...itemsSchema.imports);
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
        schema.allOf.forEach(parent => {
            if (parent.$ref) {
                const extend: Type = getType(parent.$ref);
                result.extends.push(extend.type);
                result.imports.push(extend.base);
            }

            // Merge properties of other models
            if (parent.properties) {
                const properties: Dictionary<OpenApiSchema & OpenApiReference> | undefined = schema.properties;
                for (const propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        const propertyOrReference: OpenApiSchema & OpenApiReference = properties[propertyName];
                        const property: OpenApiSchema = getRef<OpenApiSchema>(openApi, propertyOrReference);
                        const propertySchema: Schema = getSchema(openApi, property);
                        console.log('propertyName 2', propertyName, propertySchema);
                        // model.imports.push(...properties.imports);
                        // model.properties.push(...properties.properties);
                        // model.enums.push(...properties.enums);
                    }
                }
            }
        });
    }

    const properties: Dictionary<OpenApiSchema & OpenApiReference> | undefined = schema.properties;
    for (const propertyName in properties) {
        if (properties.hasOwnProperty(propertyName)) {
            const propertyOrReference: OpenApiSchema & OpenApiReference = properties[propertyName];
            const property: OpenApiSchema = getRef<OpenApiSchema>(openApi, propertyOrReference);
            const propertySchema: Schema = getSchema(openApi, property);
            console.log('propertyName 1', propertyName, propertySchema);
            // console.log('property??', property);
            // console.log('propertyName', propertyName);
            // getModelProperty(propertyName, property);
        }
    }

    return result;
}
