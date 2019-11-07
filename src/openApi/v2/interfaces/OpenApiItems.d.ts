/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#itemsObject
 */
export interface OpenApiItems {
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array';
    format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    items?: OpenApiItems;
    collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes';
    default?: any;
    maximum?: number;
    exclusiveMaximum?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: number;
    enum?: string[];
    multipleOf?: number;
}
