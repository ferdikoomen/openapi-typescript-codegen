import { Dictionary } from '../../../utils/types';
import { OpenApiMediaType } from './OpenApiMediaType';
import { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#requestBodyObject
 */
export interface OpenApiRequestBody extends OpenApiReference {
    description?: string;
    content: Dictionary<OpenApiMediaType>;
    required?: boolean;
    nullable?: boolean;
}
