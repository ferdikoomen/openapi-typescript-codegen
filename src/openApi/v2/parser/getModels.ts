import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export function getModels(openApi: OpenApi): Map<string, Model> {
    const models = new Map<string, Model>();
    for (const definitionName in openApi.definitions) {
        if (openApi.definitions.hasOwnProperty(definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionType = getType(definitionName);
            const model = getModel(openApi, definition, false, definitionType.base);
            models.set(definitionType.base, model);
        }
    }
    return models;
}
