import type { OpenApiPath } from './OpenApiPath';
import type { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#callbackObject
 */
export interface OpenApiCallback extends OpenApiReference {
    [key: string]: OpenApiPath;
}
