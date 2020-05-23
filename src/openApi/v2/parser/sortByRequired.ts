import { OperationParameter } from '../../../client/interfaces/OperationParameter';

/**
 * Sort by required and default values creating the following order:
 * 1. Parameters that are required and have no default value
 * 2. Parameters that are optional and have no default value
 * 3. Parameters that are required and have a default value
 * 4. Parameters that are optional and have a default value
 *
 * Resulting in the following order:
 *
 * function myFunction(param1: string, param2?: string, param3: string = 'hello') {
 *    ...
 * }
 *
 * @param a
 * @param b
 */
export function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    const aHasDefaultValue = a.default !== undefined;
    const bHasDefaultValue = b.default !== undefined;
    if (aHasDefaultValue && !bHasDefaultValue) return 1;
    if (!aHasDefaultValue && bHasDefaultValue) return -1;
    if (a.isRequired && !b.isRequired) return -1;
    if (!a.isRequired && b.isRequired) return 1;
    return 0;
}
