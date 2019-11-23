import { OpenApi } from '../interfaces/OpenApi';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { PrimaryType } from './constants';
import { getComment } from './getComment';
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

    // If this response has a schema, then we need to check two things:
    // if this is a reference then the parameter is just the 'name' of
    // this reference type. Otherwise it might be a complex schema and
    // then we need to parse the schema!
    if (response.schema) {
        if (response.schema.$ref) {
            const model = getType(response.schema.$ref);
            operationResponse.export = 'reference';
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.imports.push(...model.imports);
        } else {
            const model = getModel(openApi, response.schema);
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

    return operationResponse;
}
