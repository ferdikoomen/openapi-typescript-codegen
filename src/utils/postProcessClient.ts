import { Client } from '../client/interfaces/Client';
import { postProcessModel } from './postProcessModel';
import { postProcessService } from './postProcessService';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 * @param useUnionTypes Use inclusive union types.
 */
export function postProcessClient(client: Client, useUnionTypes: boolean): Client {
    return {
        ...client,
        models: client.models.map(model => postProcessModel(model, client, useUnionTypes)),
        services: client.services.map(service => postProcessService(service, client, useUnionTypes)),
    };
}
