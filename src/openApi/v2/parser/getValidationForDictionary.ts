import { Model } from '../../../client/interfaces/Model';
import { EOL } from 'os';

export function getValidationForDictionary(name: string, model: Model): string {
    /* prettier-ignore */
    return [
        `yup.lazy<Dictionary<${model.type}>>(value =>`,
        `yup.object<Dictionary<${model.type}>>().shape(`,
        `Object.entries(value).reduce((obj, item) => ({`,
        `...obj,`,
        `[item[0]]: ${model.validation ? model.validation : 'yup.mixed()'},`,
        `}), {})`,
        `)`,
        `)`
    ].join(EOL);
}
