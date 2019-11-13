import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getSchema } from './getSchema';
import { Schema } from '../../../client/interfaces/Schema';
import { Type } from '../../../client/interfaces/Type';
import { getType } from '../../v3/parser/getType';
import { getModelTemplate } from './getModelTemplate';

/**
 * Get the OpenAPI models.
 */
export function getModels(openApi: OpenApi): Map<string, Model> {
    const models: Map<string, Model> = new Map<string, Model>();

    // Iterate over the definitions
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition: OpenApiSchema = openApi.definitions[definitionName];
            const definitionSchema: Schema = getSchema(openApi, definition);
            const modelClass: Type = getType(definitionName);
            const modelTemplate: string = getModelTemplate(modelClass);

            if (models.has(modelClass.base)) {
                continue;
            }

            definitionSchema.base = modelClass.base;
            definitionSchema.type = modelClass.type;
            definitionSchema.template = modelTemplate;

            models.set(modelClass.base, definitionSchema);
        }
    }

    return models;
}
