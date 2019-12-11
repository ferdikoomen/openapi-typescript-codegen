import {Dictionary} from '../../../utils/types';
import {OpenApiExternalDocs} from './OpenApiExternalDocs';
import {OpenApiInfo} from './OpenApiInfo';
import {OpenApiParameter} from './OpenApiParameter';
import {OpenApiPath} from './OpenApiPath';
import {OpenApiResponse} from './OpenApiResponse';
import {OpenApiSchema} from './OpenApiSchema';
import {OpenApiSecurityRequirement} from './OpenApiSecurityRequirement';
import {OpenApiSecurityScheme} from './OpenApiSecurityScheme';
import {OpenApiTag} from './OpenApiTag';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
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
