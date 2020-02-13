import { OperationParameter } from '../../../client/interfaces/OperationParameter';

export function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    return a.isRequired && !b.isRequired ? -1 : !a.isRequired && b.isRequired ? 1 : 0;
}
