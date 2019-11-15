import { Type } from '../../../client/interfaces/Type';

export function getValidationForArrayRef(ref: Type, required: boolean = false, nullable: boolean = false): string {
    let validation = `yup.array<${ref.type}>().of(${ref.base}.schema)`;

    if (required) {
        validation = `${validation}.required()`;
    }

    if (nullable) {
        validation = `${validation}.nullable()`;
    }

    return validation;
}
