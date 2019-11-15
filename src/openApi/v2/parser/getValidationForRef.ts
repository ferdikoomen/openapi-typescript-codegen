import { Type } from '../../../client/interfaces/Type';

export function getValidationForRef(ref: Type, required = false, nullable = false): string {
    let validation = `${ref.base}.schema`;

    if (required) {
        validation = `${validation}.required()`;
    }

    if (nullable) {
        validation = `${validation}.nullable()`;
    }

    return validation;
}
