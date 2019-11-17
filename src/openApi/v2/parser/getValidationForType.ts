import { PrimaryType } from './constants';
import { Type } from '../../../client/interfaces/Type';

export function getValidationForType(type: Type): string {
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
    return validation;
}
