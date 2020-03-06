import { WithEnumExtension } from './Extensions/WithEnumExtension';
import { OpenApiItems } from './OpenApiItems';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiSchema } from './OpenApiSchema';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
 */
export interface OpenApiParameter extends OpenApiReference, WithEnumExtension {
    name: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    description?: string;
    required?: boolean;
    schema?: OpenApiSchema;
    type?: string;
    format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    allowEmptyValue?: boolean;
    items?: OpenApiItems;
    collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
    default?: any;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    enum?: (string | number)[];
    multipleOf?: number;
}
