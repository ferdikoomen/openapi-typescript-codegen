import { Schema } from '../../../client/interfaces/Schema';
import { OpenApi } from '../interfaces/OpenApi';

/**
 * Parse and return the OpenAPI schemas.
 * @param openApi
 */
export function getSchemas(openApi: OpenApi): Map<string, Schema> {
    const schemas = new Map<string, Schema>();
    return schemas;
}
