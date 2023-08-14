import type { Client } from '../client/interfaces/Client';

import { postProcessModel } from './postProcessModel.js';
import { postProcessService } from './postProcessService.js';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
export const postProcessClient = (client: Client): Client => {
    return {
        ...client,
        models: client.models.map(model => postProcessModel(model)),
        services: client.services.map(service => postProcessService(service)),
    };
};
