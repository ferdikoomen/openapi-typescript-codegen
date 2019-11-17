import { PrimaryType } from './constants';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';

export function getOperationResponse(responses: OperationResponse[]): OperationResponse {
    // Fetch the first valid (2XX range) response code and return that type.
    const result = responses.find(response => response.code && response.code >= 200 && response.code < 300);
    if (result) {
        return result;
    }

    return {
        code: 200,
        text: '',
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        imports: [],
    };
}
