import type { Client } from '../../client/interfaces/Client';
import type { OpenApi } from './interfaces/OpenApi';

import { getModels } from './parser/getModels.js';
import { getServer } from './parser/getServer.js';
import { getServices } from './parser/getServices.js';
import { getServiceVersion } from './parser/getServiceVersion.js';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export const parse = (openApi: OpenApi): Client => {
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = getModels(openApi);
    const services = getServices(openApi);

    return { version, server, models, services };
};
