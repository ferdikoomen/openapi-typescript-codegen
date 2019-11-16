import { Model } from '../../../client/interfaces/Model';
import { OpenApi } from '../interfaces/OpenApi';

/**
 * Parse and return the OpenAPI models.
 * @param openApi
 */
export function getModels(openApi: OpenApi): Map<string, Model> {
    const models = new Map<string, Model>();
    return models;
}
