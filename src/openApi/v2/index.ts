import {Client} from '../../client/interfaces/Client';
import {OpenApi} from './interfaces/OpenApi';
import {getModels} from './parser/getModels';
import {getServer} from './parser/getServer';
import {getServiceVersion} from './parser/getServiceVersion';
import {getServices} from './parser/getServices';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export function parse(openApi: OpenApi): Client {
    return {
        version: getServiceVersion(openApi.info.version),
        server: getServer(openApi),
        models: getModels(openApi),
        services: getServices(openApi),
    };
}
