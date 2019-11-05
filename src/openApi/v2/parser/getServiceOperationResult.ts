import { ServiceOperationResponse } from '../../../client/interfaces/ServiceOperationResponse';

export interface ServiceOperationResult {
    type: string;
    imports: string[];
}

/**
 * Parse service result.
 * @param responses List of service responses.
 * @returns Object containing the result type and needed imports.
 */
export function getServiceOperationResult(responses: ServiceOperationResponse[]): ServiceOperationResult {
    let resultType = 'any';
    let resultImports: string[] = [];

    // Fetch the first valid (2XX range) response code and return that type.
    const result = responses.find(response => response.code && response.code >= 200 && response.code < 300 && response.property);

    if (result) {
        resultType = result.property.type;
        resultImports = [...result.property.imports];
    }

    return {
        type: resultType,
        imports: resultImports,
    };
}
