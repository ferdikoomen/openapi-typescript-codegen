import { ServiceOperationResponse } from '../../../client/interfaces/ServiceOperationResponse';
import { ServiceOperationError } from '../../../client/interfaces/ServiceOperationError';

/**
 * Get list of service errors.
 * @param responses List of parsed service responses.
 * @returns List of service errors containing the error code and message.
 */
export function getServiceOperationErrors(responses: ServiceOperationResponse[]): ServiceOperationError[] {
    return responses
        .filter((response: ServiceOperationResponse): boolean => response.code >= 300 && response.text !== undefined && response.text !== '')
        .map(response => ({
            code: response.code,
            text: response.text,
        }));
}
