import { Dictionary } from '../../../utils/types';
import { OpenApiCallback } from './OpenApiCallback';
import { OpenApiExample } from './OpenApiExample';
import { OpenApiHeader } from './OpenApiHeader';
import { OpenApiLink } from './OpenApiLink';
import { OpenApiParameter } from './OpenApiParameter';
import { OpenApiReference } from './OpenApiReference';
import { OpenApiRequestBody } from './OpenApiRequestBody';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSchema } from './OpenApiSchema';
import { OpenApiSecurityScheme } from './OpenApiSecurityScheme';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#componentsObject
 */
export interface OpenApiComponents {
    schemas?: Dictionary<OpenApiSchema & OpenApiReference>;
    responses?: Dictionary<OpenApiResponses & OpenApiReference>;
    parameters?: Dictionary<OpenApiParameter & OpenApiReference>;
    examples?: Dictionary<OpenApiExample & OpenApiReference>;
    requestBodies?: Dictionary<OpenApiRequestBody & OpenApiReference>;
    headers?: Dictionary<OpenApiHeader & OpenApiReference>;
    securitySchemes: Dictionary<OpenApiSecurityScheme & OpenApiReference>;
    links?: Dictionary<OpenApiLink & OpenApiReference>;
    callbacks?: Dictionary<OpenApiCallback & OpenApiReference>;
}
