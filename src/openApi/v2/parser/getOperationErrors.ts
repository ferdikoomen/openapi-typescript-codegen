import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { OperationError } from '../../../client/interfaces/OperationError';

export function getOperationErrors(responses: OperationResponse[]): OperationError[] {
    return responses
        .filter((response: OperationResponse): boolean => response.code >= 300 && response.text !== undefined && response.text !== '')
        .map(response => ({
            code: response.code,
            text: response.text,
        }));
}
