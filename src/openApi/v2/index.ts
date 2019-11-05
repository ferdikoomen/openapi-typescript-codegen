import { OpenApi } from './interfaces/OpenApi';
import { Client } from '../../client/interfaces/Client';
import { getServer } from './parser/getServer';
import { getServices } from './parser/getServices';
import { getModels } from './parser/getModels';
import { getSchemas } from './parser/getSchemas';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export function parse(openApi: OpenApi): Client {
    return {
        version: openApi.info.version,
        server: getServer(openApi),
        models: getModels(openApi),
        schemas: getSchemas(openApi),
        services: getServices(openApi),
    };
}
