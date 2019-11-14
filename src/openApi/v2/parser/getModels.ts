import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getSchema } from './getSchema';
import { Schema } from '../../../client/interfaces/Schema';

/**
 * Get the OpenAPI models.
 */
export function getModels(openApi: OpenApi): Map<string, Model> {
    const models: Map<string, Model> = new Map<string, Model>();
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition: OpenApiSchema = openApi.definitions[definitionName];
            const definitionSchema: Schema = getSchema(openApi, definition, definitionName);
            models.set(definitionSchema.name, definitionSchema);
        }
    }
    return models;
}
