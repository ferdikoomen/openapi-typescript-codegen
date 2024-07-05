import type { OpenApiExternalDocs } from './OpenApiExternalDocs';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#tagObject
 */
export interface OpenApiTag {
    name: string;
    description?: string;
    externalDocs?: OpenApiExternalDocs;
}
