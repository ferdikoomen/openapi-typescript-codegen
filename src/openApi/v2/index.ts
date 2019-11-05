import { OpenApi } from './interfaces/OpenApi';
import { Client } from '../../client/interfaces/Client';
import { getServer } from './parser/getServer';
import { getServices } from './parser/getServices';
import { getModels } from './parser/getModels';
import { getSchemas } from './parser/getSchemas';

export function parse(openApi: OpenApi): Client {
    return {
        version: openApi.info.version,
        server: getServer(openApi),
        models: getModels(openApi),
        schemas: getSchemas(openApi),
        services: getServices(openApi),
    };
}
