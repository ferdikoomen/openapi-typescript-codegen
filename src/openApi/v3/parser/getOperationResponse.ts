import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getType } from './getType';

export function getOperationResponse(openApi: OpenApi, response: OpenApiResponse, responseCode: number): OperationResponse {
    const operationResponse: OperationResponse = {
        name: '',
        code: responseCode,
        description: getComment(response.description)!,
        export: 'generic',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        link: null,
        isProperty: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        extends: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (response.content) {
        const schema = getContent(openApi, response.content);
        if (schema) {
            if (schema && schema.$ref) {
                const model = getType(schema.$ref);
                operationResponse.export = 'reference';
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.imports.push(...model.imports);
            } else {
                const model = getModel(openApi, schema);
                operationResponse.export = model.export;
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.link = model.link;
                operationResponse.imports.push(...model.imports);
                operationResponse.extends.push(...model.extends);
                operationResponse.enum.push(...model.enum);
                operationResponse.enums.push(...model.enums);
                operationResponse.properties.push(...model.properties);
            }
        }
    }

    return operationResponse;
}
