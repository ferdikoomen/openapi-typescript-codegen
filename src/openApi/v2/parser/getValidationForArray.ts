import { Model } from '../../../client/interfaces/Model';

export function getValidationForArray(name: string, model: Model): string {
    return `yup.array<${name ? name : 'any'}>().of(${model.validation ? model.validation : 'yup.mixed()'})`;
}
