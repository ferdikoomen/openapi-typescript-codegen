import { Dictionary } from '../../../utils/types';
import { OpenApiCallback } from './OpenApiCallback';
import { OpenApiExample } from './OpenApiExample';
import { OpenApiHeader } from './OpenApiHeader';
import { OpenApiLink } from './OpenApiLink';
import { OpenApiParameter } from './OpenApiParameter';
import { OpenApiRequestBody } from './OpenApiRequestBody';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSchema } from './OpenApiSchema';
import { OpenApiSecurityScheme } from './OpenApiSecurityScheme';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#componentsObject
 */
export interface OpenApiComponents {
    schemas?: Dictionary<OpenApiSchema>;
    responses?: Dictionary<OpenApiResponses>;
    parameters?: Dictionary<OpenApiParameter>;
    examples?: Dictionary<OpenApiExample>;
    requestBodies?: Dictionary<OpenApiRequestBody>;
    headers?: Dictionary<OpenApiHeader>;
    securitySchemes?: Dictionary<OpenApiSecurityScheme>;
    links?: Dictionary<OpenApiLink>;
    callbacks?: Dictionary<OpenApiCallback>;
}
