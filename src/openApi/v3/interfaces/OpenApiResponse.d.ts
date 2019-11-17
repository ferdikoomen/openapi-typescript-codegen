import { Dictionary } from '../../../utils/types';
import { OpenApiHeader } from './OpenApiHeader';
import { OpenApiLink } from './OpenApiLink';
import { OpenApiMediaType } from './OpenApiMediaType';
import { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#responseObject
 */
export interface OpenApiResponse extends OpenApiReference {
    description: string;
    headers?: Dictionary<OpenApiHeader>;
    content?: Dictionary<OpenApiMediaType>;
    links?: Dictionary<OpenApiLink>;
}
