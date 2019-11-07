import { OpenApi } from '../interfaces/OpenApi';
import { Schema } from '../../../client/interfaces/Schema';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';

export function getSchema(openApi: OpenApi, schema: OpenApiSchema): Schema {
    return {
        type: 'todo',
        base: 'todo',
        template: null,
        imports: [],
    };
}
