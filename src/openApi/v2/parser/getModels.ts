import type { Model } from '../../../client/interfaces/Model';
import { reservedWords } from '../../../utils/reservedWords';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export const getModels = (openApi: OpenApi): Model[] => {
    const models: Model[] = [];
    for (const definitionName in openApi.definitions) {
        if (Object.prototype.hasOwnProperty.call(openApi.definitions, definitionName)) {
            const definition = openApi.definitions[definitionName];
            const definitionType = getType(definitionName);
            const model = getModel(openApi, definition, true, definitionType.base.replace(reservedWords, '_$1'));
            models.push(model);
        }
    }
    return models;
};
