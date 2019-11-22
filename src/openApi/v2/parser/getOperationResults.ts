import { PrimaryType } from './constants';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { Schema } from '../../../client/interfaces/Schema';

function areEqual(a: Schema, b: Schema): boolean {
    return a.type === b.type && a.base === b.base && a.template === b.template;
}

export function getOperationResults(operationResponses: OperationResponse[]): OperationResponse[] {
    const operationResults: OperationResponse[] = [];

    operationResponses.forEach(operationResponse => {
        if (operationResponse.code && operationResponse.code >= 200 && operationResponse.code < 300) {
            operationResults.push(operationResponse);
        }
    });

    if (!operationResults.length) {
        operationResults.push({
            code: 200,
            description: '',
            export: 'interface',
            type: PrimaryType.OBJECT,
            base: PrimaryType.OBJECT,
            template: null,
            imports: [],
            link: null,
        });
    }

    return operationResults.filter((operationResult, index, arr) => {
        return (
            arr.findIndex(item => {
                return areEqual(item, operationResult);
            }) === index
        );
    });
}
