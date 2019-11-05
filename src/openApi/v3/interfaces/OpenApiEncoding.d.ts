import { Dictionary } from '../../../utils/types';
import { OpenApiHeader } from './OpenApiHeader';
import { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#encodingObject
 */
export interface OpenApiEncoding {
    contentType?: string;
    headers?: Dictionary<OpenApiHeader & OpenApiReference>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}
