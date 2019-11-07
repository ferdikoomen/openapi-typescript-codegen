import { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponseCode } from './getOperationResponseCode';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { OpenApiResponse } from '../interfaces/OpenApiResponse';
import { OpenApiReference } from '../interfaces/OpenApiReference';
import { getRef } from './getRef';
import { OpenApi } from '../interfaces/OpenApi';

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

            // TODO:
            if (response.schema) {
                console.log('response.schema', response.schema);
            }

            if (responseCode) {
                result.push({
                    code: responseCode,
                    text: responseText,
                });
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return result.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
