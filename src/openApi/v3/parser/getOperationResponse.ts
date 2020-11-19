import type { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { getExternalReference, isLocalRef } from '../../../utils/refs';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getComment } from './getComment';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getPattern } from './getPattern';
import { getType } from './getType';

export async function getOperationResponse(openApi: OpenApi, response: OpenApiResponse, responseCode: number): Promise<OperationResponse> {
    const operationResponse: OperationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: getComment(response.description)!,
        export: 'generic',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };

    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                return operationResponse;
            }
        }
    }

    if (response.content) {
        const schema = getContent(openApi, response.content);
        if (schema) {
            if (schema?.$ref) {
                if (isLocalRef(schema.$ref)) {
                    const model = getType(schema.$ref);
                    operationResponse.export = 'reference';
                    operationResponse.type = model.type;
                    operationResponse.base = model.base;
                    operationResponse.template = model.template;
                    operationResponse.imports.push(...model.imports);
                } else {
                    const resolvedDefinition = await getExternalReference<OpenApiSchema>(openApi.$meta, schema.$ref);
                    const model = await getModel(openApi, resolvedDefinition, true, resolvedDefinition.title);
                    operationResponse.export = 'reference';
                    operationResponse.type = model.type;
                    operationResponse.base = model.base;
                    operationResponse.template = model.template;
                    operationResponse.imports.push(...model.imports);
                }
                return operationResponse;
            } else {
                const model = await getModel(openApi, schema);
                operationResponse.export = model.export;
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.link = model.link;
                operationResponse.isReadOnly = model.isReadOnly;
                operationResponse.isRequired = model.isRequired;
                operationResponse.isNullable = model.isNullable;
                operationResponse.format = model.format;
                operationResponse.maximum = model.maximum;
                operationResponse.exclusiveMaximum = model.exclusiveMaximum;
                operationResponse.minimum = model.minimum;
                operationResponse.exclusiveMinimum = model.exclusiveMinimum;
                operationResponse.multipleOf = model.multipleOf;
                operationResponse.maxLength = model.maxLength;
                operationResponse.minLength = model.minLength;
                operationResponse.maxItems = model.maxItems;
                operationResponse.minItems = model.minItems;
                operationResponse.uniqueItems = model.uniqueItems;
                operationResponse.maxProperties = model.maxProperties;
                operationResponse.minProperties = model.minProperties;
                operationResponse.pattern = getPattern(model.pattern);
                operationResponse.imports.push(...model.imports);
                operationResponse.extends.push(...model.extends);
                operationResponse.enum.push(...model.enum);
                operationResponse.enums.push(...model.enums);
                operationResponse.properties.push(...model.properties);
                return operationResponse;
            }
        }
    }

    return operationResponse;
}
