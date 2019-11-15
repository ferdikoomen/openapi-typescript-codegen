import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';

export function getModels(openApi: OpenApi): Model[] {
    const models: Model[] = [];
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionModel = getModel(openApi, definition, definitionName);
            models.push(definitionModel);
        }
    }
    return models;
}
