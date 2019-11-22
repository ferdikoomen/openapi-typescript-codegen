import { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponseCode } from './getOperationResponseCode';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { getRef } from './getRef';
import { OpenApi } from '../interfaces/OpenApi';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { getType } from './getType';
import { getModel } from './getModel';
import { getComment } from './getComment';
import { PrimaryType } from './constants';

export function getOperationResponses(openApi: OpenApi, responses: OpenApiResponses): OperationResponse[] {
    const operationResponses: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference = responses[code];
            const response = getRef<OpenApiResponse>(openApi, responseOrReference);
            const responseCode = getOperationResponseCode(code);

            // If there is a response code then we check what data we get back,
            // if there is no typed data, we just return <any> so the user is still
            // free to do their own casting if needed.
            if (responseCode) {
                const operationResponse: OperationResponse = {
                    code: responseCode,
                    description: getComment(response.description)!,
                    export: 'generic',
                    type: PrimaryType.OBJECT,
                    base: PrimaryType.OBJECT,
                    template: null,
                    link: null,
                    imports: [],
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
                        operationResponse.imports.push(...model.imports);
                        operationResponse.link = model;
                    }
                }

                operationResponses.push(operationResponse);
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
