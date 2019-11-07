import { Dictionary } from '../../../utils/types';
import { OpenApiExternalDocs } from './OpenApiExternalDocs';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiXml } from './OpenApiXml';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
 */
export interface OpenApiSchema {
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
}
