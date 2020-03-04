import { Model } from '../../../client/interfaces/Model';
import { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { PrimaryType } from './constants';

function areEqual(a: Model, b: Model): boolean {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual(a.link, b.link);
    }
    return equal;
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
            in: 'response',
            name: '',
            code: 200,
            description: '',
            export: 'interface',
            type: PrimaryType.OBJECT,
            base: PrimaryType.OBJECT,
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            extends: [],
            enum: [],
            enums: [],
            properties: [],
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
