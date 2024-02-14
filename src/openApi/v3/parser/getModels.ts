import type { Model } from '../../../client/interfaces/Model';
import { reservedWords } from '../../../utils/reservedWords';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';
import type { OpenApiPaths } from '../interfaces/OpenApiPaths';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { OpenApiParameter } from '../interfaces/OpenApiParameter';

export const getModels = (openApi: OpenApi): Model[] => {
    const models: Model[] = [];
    for (const url in openApi.paths) {
        if (!openApi.paths.hasOwnProperty(url)) {
            continue;
        }
        const path = openApi.paths[url];
        for (const method in path) {
            if (!path.hasOwnProperty(method)) {
               continue;
            }
            if(method !== 'get') {
                continue;
            }
            const operation = path[method]!;
            const parameters = operation.parameters;
            if(!parameters) {
                continue;
            }
            const operationId = operation.operationId;
            const openApiSchema: OpenApiSchema = {};
            openApiSchema.type = 'object'
            openApiSchema.required = []
            openApiSchema.properties = {};
            parameters.forEach(param=> {
                const schema = param.schema;
                if(schema) {
                    openApiSchema.properties![param.name] = schema;
                    if(param.required) {
                        openApiSchema.required!.push(param.name);
                    }
                }
            })
            const definitionType = getType(`${operationId}Query`);
            const model = getModel(openApi, openApiSchema, true, definitionType.base.replace(reservedWords, '_$1'));
            models.push(model);
        }
    }
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel(openApi, definition, true, definitionType.base.replace(reservedWords, '_$1'));
                models.push(model);
            }
        }
        for (const definitionName in openApi.components.parameters) {
            if (openApi.components.parameters.hasOwnProperty(definitionName)) {
                const definition = openApi.components.parameters[definitionName];
                const definitionType = getType(definitionName);
                const schema = definition.schema;
                if (schema) {
                    const model = getModel(openApi, schema, true, definitionType.base.replace(reservedWords, '_$1'));
                    model.description = definition.description || null;
                    model.deprecated = definition.deprecated;
                    models.push(model);
                }
            }
        }
    }
    return models;
};
