import { Dictionary } from '../../../utils/types';
import { OpenApiDiscriminator } from './OpenApiDiscriminator';
import { OpenApiExternalDocs } from './OpenApiExternalDocs';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiXml } from './OpenApiXml';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#schemaObject
 */
export interface OpenApiSchema {
    title?: string;
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
    allOf?: (OpenApiSchema & OpenApiReference)[];
    oneOf?: (OpenApiSchema & OpenApiReference)[];
    anyOf?: (OpenApiSchema & OpenApiReference)[];
    not?: (OpenApiSchema & OpenApiReference)[];
    items?: OpenApiSchema & OpenApiReference;
    properties?: Dictionary<OpenApiSchema & OpenApiReference>;
    additionalProperties?: boolean | (OpenApiSchema & OpenApiReference);
    description?: string;
    format?: 'int32' | 'int64' | 'float' | 'double' | 'string' | 'boolean' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    default?: any;
    nullable?: boolean;
    discriminator?: OpenApiDiscriminator;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: OpenApiXml;
    externalDocs?: OpenApiExternalDocs;
    example?: any;
    deprecated?: boolean;
}
