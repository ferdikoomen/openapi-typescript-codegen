import { generate, Options } from './generate';
import { isString } from './utils/isString';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { Dictionary } from './utils/types';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { removeLodashPrefix } from './utils/removeLodashPrefix';
import { mapSwaggerRef } from './utils/mapSwaggerRef';
import { removeLodashPrefixFromRef } from './utils/removeLodashPrefixFromRef';
import RefParser from 'json-schema-ref-parser';

type Config = Options & {
    useSaddlebackServices?: boolean;
    additionalModelFileExtension?: boolean;
    additionalServiceFileExtension?: boolean;
    removeLodashPrefixes?: boolean;
};

export const generateSaddlebackSpec = async (config: Config) => {
    const url = 'https://hc-eventservice-dev.azurewebsites.net/api-doc/all/swagger.json';
    const test = await RefParser.bundle(url, url, {
        resolve: {
            http: {
                withCredentials: true,
                headers: {
                    'Cookie': 'ARRAffinity=7d18d5957d129d3dc3a25d7a2c85147ef57f1a6b93910c50eb850417ab59dc56; ARRAffinitySameSite=7d18d5957d129d3dc3a25d7a2c85147ef57f1a6b93910c50eb850417ab59dc56; apiKey=eyJhbGciOiJSUzI1NiIsImtpZCI6IjRCNDc1Q0I5RUQ5QTAzNThFMzExRjNBMjEwOERCNERDOUJGMDQ0MTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJTMGRjdWUyYUExampFZk9pRUkyMDNKdndSQkkifQ.eyJuYmYiOjE2NTU3MDc5MjcsImV4cCI6MTY1NTcxMTUyNywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc2FkZGxlYmFjay5jb20iLCJhdWQiOlsiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc2FkZGxlYmFjay5jb20vcmVzb3VyY2VzIiwiY20tYXBpIl0sImNsaWVudF9pZCI6ImNtIiwic3ViIjoiNzc5ODMxMCIsImF1dGhfdGltZSI6MTY1NTcwNzkyNSwiaWRwIjoibG9jYWwiLCJ1cm46c2FkZGxlYmFjazp1c2VyX2lkIjpbIjg4YjI4ODk1LTQyMDgtNDY5NC1hZGQ4LWYzYWJhZjUzYjFlYiIsIjg4YjI4ODk1LTQyMDgtNDY5NC1hZGQ4LWYzYWJhZjUzYjFlYiJdLCJpZCI6Ijc3OTgzMTAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXJuOnNhZGRsZWJhY2s6cGVyc29uX2xpbmsiOiJFeGlzdGluZ1JlY29yZCIsInNjb3BlIjpbImNtLWFwaS5kZWZhdWx0Il0sImFtciI6WyJwd2QiXX0.qstJ8gSzRFXgo5hcBlj7BusYSxno-Cx_l96CQjqlRXfiTBOrouCpcCdrQLuaafZrJv7Hvn_jogOI7-r6d_qB575NIPBKNed7Z6LSQcXHWbvZVBB3J9Ch1g5M8U3eG71_uuBF7aFb_ecVVktOHcGDeC24g7UrmI5_jRFf9rYXbT0lhH4KwSIZzMFOS19Wd8txa7XE_rIDkhzetcH1z2sf9QL5Vd9RkdJUgFKPJEneyRmeZyBxHKn5cgrtF3cANZJlvIBZ2Mxu1OFxcQx6mGy-nHUTEPz1dHFPi2FZ8xkBgUxLeaQMflLgIv6nICpe_uESRvP91MxIQ--vEsrjN7Cy9A; SL_G_WPT_TO=ru; SL_GWPT_Show_Hide_tmp=1; SL_wptGlobTipTmp=1',
                    'Authorizations': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjRCNDc1Q0I5RUQ5QTAzNThFMzExRjNBMjEwOERCNERDOUJGMDQ0MTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJTMGRjdWUyYUExampFZk9pRUkyMDNKdndSQkkifQ.eyJuYmYiOjE2NTU3MDc5MjcsImV4cCI6MTY1NTcxMTUyNywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc2FkZGxlYmFjay5jb20iLCJhdWQiOlsiaHR0cHM6Ly9pZGVudGl0eS1kZXYuc2FkZGxlYmFjay5jb20vcmVzb3VyY2VzIiwiY20tYXBpIl0sImNsaWVudF9pZCI6ImNtIiwic3ViIjoiNzc5ODMxMCIsImF1dGhfdGltZSI6MTY1NTcwNzkyNSwiaWRwIjoibG9jYWwiLCJ1cm46c2FkZGxlYmFjazp1c2VyX2lkIjpbIjg4YjI4ODk1LTQyMDgtNDY5NC1hZGQ4LWYzYWJhZjUzYjFlYiIsIjg4YjI4ODk1LTQyMDgtNDY5NC1hZGQ4LWYzYWJhZjUzYjFlYiJdLCJpZCI6Ijc3OTgzMTAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXJuOnNhZGRsZWJhY2s6cGVyc29uX2xpbmsiOiJFeGlzdGluZ1JlY29yZCIsInNjb3BlIjpbImNtLWFwaS5kZWZhdWx0Il0sImFtciI6WyJwd2QiXX0.qstJ8gSzRFXgo5hcBlj7BusYSxno-Cx_l96CQjqlRXfiTBOrouCpcCdrQLuaafZrJv7Hvn_jogOI7-r6d_qB575NIPBKNed7Z6LSQcXHWbvZVBB3J9Ch1g5M8U3eG71_uuBF7aFb_ecVVktOHcGDeC24g7UrmI5_jRFf9rYXbT0lhH4KwSIZzMFOS19Wd8txa7XE_rIDkhzetcH1z2sf9QL5Vd9RkdJUgFKPJEneyRmeZyBxHKn5cgrtF3cANZJlvIBZ2Mxu1OFxcQx6mGy-nHUTEPz1dHFPi2FZ8xkBgUxLeaQMflLgIv6nICpe_uESRvP91MxIQ--vEsrjN7Cy9A',
                }
            }
        }
    });

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
