import { OpenApiOperation } from './OpenApiOperation';
import { OpenApiParameter } from './OpenApiParameter';
import { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#pathItemObject
 */
export interface OpenApiPath extends OpenApiReference {
    get?: OpenApiOperation;
    put?: OpenApiOperation;
    post?: OpenApiOperation;
    delete?: OpenApiOperation;
    options?: OpenApiOperation;
    head?: OpenApiOperation;
    patch?: OpenApiOperation;
    parameters?: OpenApiParameter[];
}
