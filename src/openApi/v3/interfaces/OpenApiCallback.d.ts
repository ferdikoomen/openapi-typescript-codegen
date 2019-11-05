import { OpenApiPath } from './OpenApiPath';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback {
    [key: string]: OpenApiPath;
}
