import type { Dictionary } from '../../../utils/types';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiInfo } from './OpenApiInfo';
import type { OpenApiParameter } from './OpenApiParameter';
import type { OpenApiPath } from './OpenApiPath';
import type { OpenApiResponse } from './OpenApiResponse';
import type { OpenApiSchema } from './OpenApiSchema';
import type { OpenApiSecurityRequirement } from './OpenApiSecurityRequirement';
import type { OpenApiSecurityScheme } from './OpenApiSecurityScheme';
import type { OpenApiTag } from './OpenApiTag';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md
 */
export interface OpenApi {
    swagger: string;
    info: OpenApiInfo;
    host?: string;
    basePath?: string;
    schemes?: string[];
    consumes?: string[];
    produces?: string[];
    paths: Dictionary<OpenApiPath>;
    definitions?: Dictionary<OpenApiSchema>;
    parameters?: Dictionary<OpenApiParameter>;
    responses?: Dictionary<OpenApiResponse>;
    securityDefinitions?: Dictionary<OpenApiSecurityScheme>;
    security?: OpenApiSecurityRequirement[];
    tags?: OpenApiTag[];
    externalDocs?: OpenApiExternalDocs;
}
