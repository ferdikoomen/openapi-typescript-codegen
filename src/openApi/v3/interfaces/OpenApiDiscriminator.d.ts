import type { Dictionary } from '../../../utils/types';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#discriminatorObject
 */
export interface OpenApiDiscriminator {
    propertyName: string;
    mapping?: Dictionary<string>;
}
