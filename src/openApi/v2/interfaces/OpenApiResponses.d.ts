import { OpenApiResponse } from './OpenApiResponse';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responsesObject
 */
export interface OpenApiResponses {
    [httpcode: string]: OpenApiResponse;

    default?: OpenApiResponse;
}
