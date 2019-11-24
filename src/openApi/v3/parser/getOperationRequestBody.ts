import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getType } from './getType';

export function getOperationRequestBody(openApi: OpenApi, parameter: OpenApiRequestBody): OperationParameter {
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
        isProperty: false,
        isReadOnly: false,
        isRequired: parameter.required === true,
        isNullable: false,
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
            } else {
                const model = getModel(openApi, schema);
                requestBody.export = model.export;
                requestBody.type = model.type;
                requestBody.base = model.base;
                requestBody.template = model.template;
                requestBody.link = model.link;
                requestBody.imports.push(...model.imports);
                requestBody.extends.push(...model.extends);
                requestBody.enum.push(...model.enum);
                requestBody.enums.push(...model.enums);
                requestBody.properties.push(...model.properties);
            }
        }
    }

    return requestBody;
}
