import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';

export function getModels(openApi: OpenApi): Model[] {
    const models: Model[] = [];
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition: OpenApiSchema = openApi.definitions[definitionName];
            const definitionModel: Model = getModel(openApi, definition, definitionName);
            models.push(definitionModel);
        }
    }
    return models;
}
