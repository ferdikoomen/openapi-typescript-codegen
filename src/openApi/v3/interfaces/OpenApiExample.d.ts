import type { OpenApiReference } from './OpenApiReference';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#exampleObject
 */
export interface OpenApiExample extends OpenApiReference {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}
