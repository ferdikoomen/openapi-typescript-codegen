import { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponseCode } from './getOperationResponseCode';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getRef } from './getRef';
import { OpenApi } from '../interfaces/OpenApi';
import { getSchemaReference } from './getSchemaReference';
import { SchemaReference } from '../../../client/interfaces/SchemaReference';

export function getOperationResponses(openApi: OpenApi, responses: OpenApiResponses): OperationResponse[] {
    const results: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            const responseOrReference: OpenApiResponse & OpenApiReference = responses[code];
            const response: OpenApiResponse = getRef<OpenApiResponse>(openApi, responseOrReference);
            const responseCode: number | null = getOperationResponseCode(code);

            // If there is a response code then we check what data we get back,
            // if there is no typed data, we just return <any> so the user is still
            // free to do their own casting if needed.
            if (responseCode) {
                const result: OperationResponse = {
                    code: responseCode,
                    text: response.description || '',
                    type: 'any',
                    base: 'any',
                    template: null,
                    imports: [],
                };

                // If this response has a schema, then we need to check two things:
                // if this is a reference then the parameter is just the 'name' of
                // this reference type. Otherwise it might be a complex schema and
                // then we need to parse the schema!
                if (response.schema) {
                    const responseSchema: SchemaReference = getSchemaReference(openApi, response.schema);
                    result.type = responseSchema.type;
                    result.base = responseSchema.base;
                    result.template = responseSchema.template;
                    result.imports.push(...responseSchema.imports);
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
