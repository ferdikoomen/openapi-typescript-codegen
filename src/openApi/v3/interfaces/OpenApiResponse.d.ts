import type { Dictionary } from '../../../utils/types';
import type { OpenApiHeader } from './OpenApiHeader';
import type { OpenApiLink } from './OpenApiLink';
import type { OpenApiMediaType } from './OpenApiMediaType';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiBase } from '../../../interfaces/OpenApiBase';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responseObject
 */
export interface OpenApiResponse extends OpenApiReference, OpenApiBase {
    description: string;
    headers?: Dictionary<OpenApiHeader>;
    content?: Dictionary<OpenApiMediaType>;
    links?: Dictionary<OpenApiLink>;
}
