import { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponseCode } from './getOperationResponseCode';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getRef } from './getRef';
import { OpenApi } from '../interfaces/OpenApi';
import { getType } from './getType';
import { Type } from '../../../client/interfaces/Type';
import { Schema } from '../../../client/interfaces/Schema';
import { getSchema } from './getSchema';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';

export function getOperationResponses(openApi: OpenApi, responses: OpenApiResponses): OperationResponse[] {
    const result: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference: OpenApiResponse & OpenApiReference = responses[code];
            const response: OpenApiResponse = getRef<OpenApiResponse>(openApi, responseOrReference);
            const responseCode: number | null = getOperationResponseCode(code);
            const responseText: string = response.description || '';
            let responseType = 'any';
            let responseBase = 'any';
            let responseTemplate: string | null = null;
            let responseImports: string[] = [];

            if (response.schema) {
                if (response.schema.$ref) {
                    const schemaReference: Type = getType(response.schema.$ref);
                    responseType = schemaReference.type;
                    responseBase = schemaReference.base;
                    responseTemplate = schemaReference.template;
                    responseImports = [...schemaReference.imports];
                } else {
                    const schema: Schema = getSchema(openApi, response.schema as OpenApiSchema);
                    responseType = schema.type;
                    responseBase = schema.base;
                    responseTemplate = schema.template;
                    responseImports = [...schema.imports];
                }
            }

            if (responseCode) {
                result.push({
                    code: responseCode,
                    text: responseText,
                    type: responseType,
                    base: responseBase,
                    template: responseTemplate,
                    imports: responseImports,
                });
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return result.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
