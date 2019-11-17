import { Type } from '../../../client/interfaces/Type';

export function getValidationForArrayRef(ref: Type): string {
    return `yup.array<${ref.type}>().of(${ref.base}.schema)`;
}
