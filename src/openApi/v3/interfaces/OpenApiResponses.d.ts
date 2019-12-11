import { OpenApiReference } from './OpenApiReference';
import { OpenApiResponse } from './OpenApiResponse';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responsesObject
 */
export interface OpenApiResponses extends OpenApiReference {
    default: OpenApiResponse;

    [httpcode: string]: OpenApiResponse;
}
