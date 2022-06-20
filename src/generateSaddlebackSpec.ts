import { generate, Options } from './generate';
import { isString } from './utils/isString';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { Dictionary } from './utils/types';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { removeLodashPrefix } from './utils/removeLodashPrefix';
import { mapSwaggerRef } from './utils/mapSwaggerRef';
import { removeLodashPrefixFromRef } from './utils/removeLodashPrefixFromRef';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
    removeLodashPrefixes?: boolean;
};

export const generateSaddlebackSpec = async (config: Config) => {
    const openApi: OpenApi = isString(config.input) ? await getOpenApiSpec(config.input) : config.input;

    if (config.removeLodashPrefixes && openApi.components && openApi.components.schemas) {
        const newSchemas: Dictionary<OpenApiSchema> = {};

        for (const schemaKey in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(schemaKey)) {
                newSchemas[removeLodashPrefix(schemaKey)] = openApi.components.schemas[schemaKey];
            }
        }

        openApi.components.schemas = newSchemas;
    }

    mapSwaggerRef(openApi, removeLodashPrefixFromRef);

    await generate({ ...config, input: openApi });
};

export default generateSaddlebackSpec;
