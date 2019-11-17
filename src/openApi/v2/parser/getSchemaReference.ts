import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { OpenApi } from '../interfaces/OpenApi';
import { PrimaryType } from './constants';

export interface SchemaReference {
    type: string;
    base: string;
    template: string | null;
    imports: string[];
}

export function getSchemaReference(openApi: OpenApi, schema: OpenApiSchema): SchemaReference {
    const result: SchemaReference = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        imports: [],
    };

    if (schema.$ref) {
        // const itemSchemaType: Type = getType(schema.$ref);
        // result.type = itemSchemaType.type;
        // result.base = itemSchemaType.base;
        // result.template = itemSchemaType.template;
        // result.imports.push(...itemSchemaType.imports);
    } else {
        // const item: OpenApiSchema = getRef<OpenApiSchema>(openApi, schema);
        // const itemSchema: Schema = getSchema(openApi, item, 'unknown');
        // result.type = itemSchema.type;
        // result.base = itemSchema.base;
        // result.template = itemSchema.template;
        // result.imports.push(...itemSchema.imports);
    }

    return result;
}
