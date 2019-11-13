import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { OpenApi } from '../interfaces/OpenApi';
import { SchemaProperty } from '../../../client/interfaces/SchemaProperty';
import { getComment } from './getComment';

export function getSchemaProperty(openApi: OpenApi, property: OpenApiSchema & OpenApiReference, name: string, required: boolean): SchemaProperty {
    const result: SchemaProperty = {
        name: name,
        type: 'any',
        base: 'any',
        template: null,
        description: getComment(property.description),
        required: required,
        nullable: false,
        readOnly: property.readOnly || false,
        extends: [],
        imports: [],
        properties: new Map<string, SchemaProperty>(),
    };

    // console.log(name, property);

    // const property: OpenApiSchema & OpenApiReference = schema.properties[propertyName];
    // const propertySchema: SchemaReference = getSchemaReference(openApi, property);
    // result.imports.push(...propertySchema.imports);
    // result.properties.set(propertyName, propertySchema);

    return result;
}
