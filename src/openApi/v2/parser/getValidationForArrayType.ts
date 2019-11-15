import { PrimaryType } from './constants';
import { Type } from '../../../client/interfaces/Type';

export function getValidationForArrayType(type: Type, required: boolean = false, nullable: boolean = false): string {
    let validation = `yup.array<any>().of(yup.mixed())`;

    switch (type.type) {
        case PrimaryType.BOOLEAN:
            validation = `yup.array<boolean>().of(yup.boolean())`;
            break;
        case PrimaryType.NUMBER:
            validation = `yup.array<number>().of(yup.number())`;
            break;
        case PrimaryType.STRING:
            validation = `yup.array<string>().of(yup.string())`;
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
