import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';
import { getType } from './getType';
import { getModelTemplate } from './getModelTemplate';

/**
 * Parse and return the OpenAPI models.
 * @param openApi
 */
export function getModels(openApi: OpenApi): Map<string, Model> {
    const models = new Map<string, Model>();
    const definitions = openApi.definitions;
    for (const definitionName in definitions) {
        if (definitions.hasOwnProperty(definitionName)) {
            const definition = definitions[definitionName];
            const required = definition.required || [];
            const modelClass = getType(definitionName);
            const modelTemplate: string = getModelTemplate(modelClass);
            if (!models.has(modelClass.base)) {
                const model: Model = {
                    name: modelClass.base,
                    base: modelClass.base,
                    type: modelClass.type,
                    template: modelTemplate,
                    description: null,
                    extends: null,
                    imports: [],
                    properties: [],
                    enums: [],
                };
                models.set(modelClass.base, model);
            }
        }
    }
    return models;
}
