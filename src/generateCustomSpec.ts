import { OpenApi } from './openApi/v3/interfaces/OpenApi';
import { OpenApiMediaType } from './openApi/v3/interfaces/OpenApiMediaType';
import { OpenApiOperation } from './openApi/v3/interfaces/OpenApiOperation';
import { OpenApiParameter } from './openApi/v3/interfaces/OpenApiParameter';
import { OpenApiSchema } from './openApi/v3/interfaces/OpenApiSchema';
import { OpenApiServer } from './openApi/v3/interfaces/OpenApiServer';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { Dictionary } from './utils/types';

export const generateCustomSpec = async (gen: any, input: string, output: string, config: Record<string, unknown>) => {
    const getSchemaRefFromContent = (content: OpenApiMediaType): string => {
        let ref: string = '';

        ref = content.$ref || content.schema?.$ref || content.schema?.items?.$ref || '';

        return ref.split('/').slice(-1)[0];
    };

    const list: OpenApi = await getOpenApiSpec(input);

    const requiredPathsList: string[] = ['/api/agreement', '/api/agreement/{id}'];

    const requiredPaths: OpenApi['paths'] = {};

    for (const path in list.paths) {
        if (requiredPathsList.some(it => it === path)) {
            requiredPaths[path] = list.paths[path];
        }
    }

    const requiredSchemasSet: Set<string> = new Set();

    for (const pathName in requiredPaths) {
        const pathElement = requiredPaths[pathName];

        const openApiPathValues = Object.values(pathElement) as (
            | OpenApiOperation
            | OpenApiServer
            | OpenApiParameter
            | string
        )[];

        openApiPathValues.forEach(requestMethodData => {
            if (typeof requestMethodData !== 'string') {
                if (!('url' in requestMethodData)) {
                    if ('parameters' in requestMethodData) {
                        // add schemas from {apiPath}/{method}/parameters
                        requestMethodData.parameters?.forEach(parameter =>
                            requiredSchemasSet.add(getSchemaRefFromContent(parameter))
                        );
                    }
                    if ('responses' in requestMethodData) {
                        const responsesCodeData = Object.values(requestMethodData.responses);

                        responsesCodeData.forEach(response => {
                            const contentTypeData = Object.values(response.content ?? {});

                            // add schemas from {apiPath}/{method}/responses/{responseType}/content
                            contentTypeData.forEach(content => {
                                requiredSchemasSet.add(getSchemaRefFromContent(content));
                            });
                        });
                    }
                }
            }
        });
    }

    const requiredSchemas: Dictionary<OpenApiSchema> = {};

    if (list && list.components && list.components.schemas) {
        for (const schema in list.components.schemas) {
            if (requiredSchemasSet.has(schema)) {
                requiredSchemas[schema] = list.components.schemas[schema];
            }
        }
    }

    const listWithRequiredPaths: OpenApi = {
        ...list,
        paths: requiredPaths,
        components: {
            schemas: requiredSchemas,
        },
    };

    await gen(listWithRequiredPaths, output);
};
