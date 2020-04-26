import { OperationResponse } from '../../../client/interfaces/OperationResponse';

export function getOperationResponseHeader(operationResponses: OperationResponse[]): string | null {
    const header = operationResponses.find(operationResponses => {
        return operationResponses.in === 'header';
    });
    if (header) {
        return header.name;
    }
    return null;
}
