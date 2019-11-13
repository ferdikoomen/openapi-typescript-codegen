import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { OperationError } from '../../../client/interfaces/OperationError';

export function getOperationErrors(responses: OperationResponse[]): OperationError[] {
    return responses
        .filter((response: OperationResponse): boolean => {
            return response.code >= 300 && response.text !== undefined && response.text !== '';
        })
        .map(
            (response: OperationResponse): OperationError => ({
                code: response.code,
                text: response.text,
            })
        );
}
