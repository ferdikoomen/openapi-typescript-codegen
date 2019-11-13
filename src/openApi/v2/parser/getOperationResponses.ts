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
    const results: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference: OpenApiResponse & OpenApiReference = responses[code];
            const response: OpenApiResponse = getRef<OpenApiResponse>(openApi, responseOrReference);
            const responseCode: number | null = getOperationResponseCode(code);
            if (responseCode) {
                const result: OperationResponse = {
                    code: responseCode,
                    text: response.description || '',
                    type: 'any',
                    base: 'any',
                    template: null,
                    imports: [],
                };

                if (response.schema) {
                    if (response.schema.$ref) {
                        const schemaReference: Type = getType(response.schema.$ref);
                        result.type = schemaReference.type;
                        result.base = schemaReference.base;
                        result.template = schemaReference.template;
                        result.imports.push(...schemaReference.imports);
                    } else {
                        const schema: Schema = getSchema(openApi, response.schema as OpenApiSchema);
                        result.type = schema.type;
                        result.base = schema.base;
                        result.template = schema.template;
                        result.imports.push(...schema.imports);
                    }
                }

                results.push(result);
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return results.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
