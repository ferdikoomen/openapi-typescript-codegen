import type { Dictionary } from '../../../utils/types';
import type { OpenApiMediaType } from './OpenApiMediaType';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiBase } from '../../../interfaces/OpenApiBase';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#requestBodyObject
 */
export interface OpenApiRequestBody extends OpenApiReference, OpenApiBase {
    description?: string;
    content: Dictionary<OpenApiMediaType>;
    required?: boolean;
    nullable?: boolean;
}
