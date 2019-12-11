import { Dictionary } from '../../../utils/types';
import { OpenApiEncoding } from './OpenApiEncoding';
import { OpenApiExample } from './OpenApiExample';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiSchema } from './OpenApiSchema';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#mediaTypeObject
 */
export interface OpenApiMediaType extends OpenApiReference {
    schema?: OpenApiSchema;
    example?: any;
    examples?: Dictionary<OpenApiExample>;
    encoding?: Dictionary<OpenApiEncoding>;
}
