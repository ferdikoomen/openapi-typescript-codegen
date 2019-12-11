import { Dictionary } from '../../../utils/types';
import { OpenApiExample } from './OpenApiExample';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiSchema } from './OpenApiSchema';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#parameterObject
 */
export interface OpenApiParameter extends OpenApiReference {
    name: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'cookie';
    description?: string;
    required?: boolean;
    nullable?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenApiSchema;
    example?: any;
    examples?: Dictionary<OpenApiExample>;
}
