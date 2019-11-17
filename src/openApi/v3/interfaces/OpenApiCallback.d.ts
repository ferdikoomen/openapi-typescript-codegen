import { OpenApiPath } from './OpenApiPath';
import { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback extends OpenApiReference {
    [key: string]: OpenApiPath;
}
