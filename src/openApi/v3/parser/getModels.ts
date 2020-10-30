import type { Model } from '../../../client/interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getRef } from './getRef';
import { getType } from './getType';

export async function getModels(openApi: OpenApi): Promise<Model[]> {
    const models: Model[] = [];
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = await getModel(openApi, definition, true, definitionType.base);
                models.push(model);
            }
        }
    }
    return models;
}
