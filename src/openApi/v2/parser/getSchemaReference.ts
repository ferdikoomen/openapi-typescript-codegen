import { getType } from './getType';
import { Type } from '../../../client/interfaces/Type';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getRef } from './getRef';
import { Schema } from '../../../client/interfaces/Schema';
import { getSchema } from './getSchema';
import { SchemaReference } from '../../../client/interfaces/SchemaReference';
import { OpenApi } from '../interfaces/OpenApi';
import { PrimaryType } from './constants';

export function getSchemaReference(openApi: OpenApi, schema: OpenApiSchema & OpenApiReference): SchemaReference {
    const result: SchemaReference = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        imports: [],
    };

    if (schema.$ref) {
        const itemSchemaType: Type = getType(schema.$ref);
        result.type = itemSchemaType.type;
        result.base = itemSchemaType.base;
        result.template = itemSchemaType.template;
        result.imports.push(...itemSchemaType.imports);
    } else {
        const item: OpenApiSchema = getRef<OpenApiSchema>(openApi, schema);
        const itemSchema: Schema = getSchema(openApi, item, 'unknown');
        result.type = itemSchema.type;
        result.base = itemSchema.base;
        result.template = itemSchema.template;
        result.imports.push(...itemSchema.imports);
    }

    return result;
}
