import { Dictionary } from '../../../utils/types';
import { OpenApiCallback } from './OpenApiCallback';
import { OpenApiExternalDocs } from './OpenApiExternalDocs';
import { OpenApiParameter } from './OpenApiParameter';
import { OpenApiRequestBody } from './OpenApiRequestBody';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import { OpenApiServer } from './OpenApiServer';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#operationObject
 */
export interface OpenApiOperation {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
    operationId?: string;
    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses: OpenApiResponses;
    callbacks?: Dictionary<OpenApiCallback>;
    deprecated?: boolean;
    security?: OpenApiSecurityRequirement[];
    servers?: OpenApiServer[];
}
