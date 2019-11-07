import { OperationResponse } from '../../../client/interfaces/OperationResponse';

export function getOperationResponse(responses: OperationResponse[]): OperationResponse {
    let responseCode = 200;
    let responseText = '';
    let responseType = 'any';
    let responseBase = 'any';
    let responseTemplate: string | null = null;
    let responseImports: string[] = [];

    // Fetch the first valid (2XX range) response code and return that type.
    const result: OperationResponse | undefined = responses.find(response => response.code && response.code >= 200 && response.code < 300);

    if (result) {
        responseCode = result.code;
        responseText = result.text;
        responseType = result.type;
        responseBase = result.base;
        responseTemplate = result.template;
        responseImports = [...result.imports];
    }

    return {
        code: responseCode,
        text: responseText,
        type: responseType,
        base: responseBase,
        template: responseTemplate,
        imports: responseImports,
    };
}
