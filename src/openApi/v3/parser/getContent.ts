import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export function getContent(openApi: OpenApi, content: Dictionary<OpenApiMediaType>): OpenApiSchema | null {
    /* prettier-ignore */
    return (
        content['application/json-patch+json'] &&
        content['application/json-patch+json'].schema
    ) || (
        content['application/json'] &&
        content['application/json'].schema
    ) || (
        content['text/json'] &&
        content['text/json'].schema
    ) || (
        content['text/plain'] &&
        content['text/plain'].schema
    ) || (
        content['multipart/mixed'] &&
        content['multipart/mixed'].schema
    ) || (
        content['multipart/related'] &&
        content['multipart/related'].schema
    ) || (
        content['multipart/batch'] &&
        content['multipart/batch'].schema
    ) || null;
}
