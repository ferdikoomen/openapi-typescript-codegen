import { PrimaryType } from './constants';
import { Type } from '../../../client/interfaces/Type';

export function getValidationForType(type: Type, required: boolean = false, nullable: boolean = false): string {
    let validation = `yup.mixed<${type.type}>()`;

    switch (type.type) {
        case PrimaryType.BOOLEAN:
            validation = `yup.boolean()`;
            break;
        case PrimaryType.NUMBER:
            validation = `yup.number()`;
            break;
        case PrimaryType.STRING:
            validation = `yup.string()`;
            break;
    }

    if (required) {
        validation = `${validation}.required()`;
    }

    if (nullable) {
        validation = `${validation}.nullable()`;
    }

    return validation;
}
