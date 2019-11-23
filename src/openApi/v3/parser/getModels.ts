import {Model} from '../../../client/interfaces/Model';
import {OpenApi} from '../interfaces/OpenApi';
import {getModel} from './getModel';
import {getType} from './getType';

export function getModels(openApi: OpenApi): Map<string, Model> {
    const models = new Map<string, Model>();
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel(openApi, definition, false, definitionType.base);
                models.set(definitionType.base, model);
            }
        }
    }
    return models;
}
