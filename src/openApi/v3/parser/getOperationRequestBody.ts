import type { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getPattern } from './getPattern';
import { getType } from './getType';

export async function getOperationRequestBody(openApi: OpenApi, parameter: OpenApiRequestBody): Promise<OperationParameter> {
    const requestBody: OperationParameter = {
        in: 'body',
        prop: 'body',
        export: 'interface',
        name: 'requestBody',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        description: getComment(parameter.description),
        default: undefined,
        isDefinition: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: parameter.nullable === true,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (parameter.content) {
        const schema = getContent(openApi, parameter.content);
        if (schema) {
            if (schema && schema.$ref) {
                const model = getType(schema.$ref);
                requestBody.export = 'reference';
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.imports.push(...model.imports);
                return requestBody;
            } else {
                const model = await getModel(openApi, schema);
                requestBody.export = model.export;
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.link = model.link;
                requestBody.isReadOnly = model.isReadOnly;
                requestBody.isRequired = requestBody.isRequired || model.isRequired;
                requestBody.isNullable = requestBody.isNullable || model.isNullable;
                requestBody.format = model.format;
                requestBody.maximum = model.maximum;
                requestBody.exclusiveMaximum = model.exclusiveMaximum;
                requestBody.minimum = model.minimum;
                requestBody.exclusiveMinimum = model.exclusiveMinimum;
                requestBody.multipleOf = model.multipleOf;
                requestBody.maxLength = model.maxLength;
                requestBody.minLength = model.minLength;
                requestBody.maxItems = model.maxItems;
                requestBody.minItems = model.minItems;
                requestBody.uniqueItems = model.uniqueItems;
                requestBody.maxProperties = model.maxProperties;
                requestBody.minProperties = model.minProperties;
                requestBody.pattern = getPattern(model.pattern);
                requestBody.imports.push(...model.imports);
                requestBody.extends.push(...model.extends);
                requestBody.enum.push(...model.enum);
                requestBody.enums.push(...model.enums);
                requestBody.properties.push(...model.properties);
                return requestBody;
            }
        }
    }

    return requestBody;
}
