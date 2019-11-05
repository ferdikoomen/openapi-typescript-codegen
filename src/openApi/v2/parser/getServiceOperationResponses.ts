import { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { ServiceOperationResponse } from '../../../client/interfaces/ServiceOperationResponse';
import { getServiceOperationResponsesCode } from './getServiceOperationResponseCode';

/**
 * Parse the service response object into a list with status codes and response messages.
 * @param responses Swagger responses.
 * @returns List of status codes and response messages.
 */
export function getServiceOperationResponses(responses: OpenApiResponses): ServiceOperationResponse[] {
    const result: ServiceOperationResponse[] = [];

    // Iterate over each response code.
    for (const code in responses) {
        if (responses.hasOwnProperty(code)) {
            // Get the status code and response message (if any).
            const response = responses[code];
            const responseCode = getServiceOperationResponsesCode(code);
            const responseText = response.description || '';

            if (responseCode) {
                result.push({
                    code: responseCode,
                    text: responseText,
                    property: undefined,
                });
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return result.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
