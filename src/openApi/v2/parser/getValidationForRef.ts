import { Type } from '../../../client/interfaces/Type';

export function getValidationForRef(ref: Type): string {
    return `${ref.base}.schema`;
}
