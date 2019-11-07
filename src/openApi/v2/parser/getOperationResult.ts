import { OperationResponse } from '../../../client/interfaces/OperationResponse';

export function getOperationResult(responses: OperationResponse[]): OperationResponse {
    const resultCode = 200;
    const resultTes: string[] = [];

    // Fetch the first valid (2XX range) response code and return that type.
    const result: OperationResponse | undefined = responses.find(response => response.code && response.code >= 200 && response.code < 300 && response.property);

    if (result && result.property) {
        resultType = result.property.type;
        resultImports = [...result.property.imports];
    }

    return {
        type: resultType,
        imports: resultImports,
    };
}
