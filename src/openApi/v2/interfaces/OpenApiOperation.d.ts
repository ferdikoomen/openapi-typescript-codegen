import { OpenApiExternalDocs } from './OpenApiExternalDocs';
import { OpenApiParameter } from './OpenApiParameter';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject
 */
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: OpenApiParameter[];
    responses: OpenApiResponses;
    schemes: ('http' | 'https' | 'ws' | 'wss')[];
    deprecated?: boolean;
    security?: OpenApiSecurityRequirement[];
}
