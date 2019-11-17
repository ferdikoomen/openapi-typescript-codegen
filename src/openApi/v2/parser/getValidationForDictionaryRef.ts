import { Type } from '../../../client/interfaces/Type';
import { EOL } from 'os';

export function getValidationForDictionaryRef(type: Type): string {
    /* prettier-ignore */
    return [
        `yup.lazy<Dictionary<${type.type}>>(value =>`,
        `yup.object<Dictionary<${type.type}>>().shape(`,
        `Object.entries(value).reduce((obj, item) => ({`,
        `...obj,`,
        `[item[0]]: ${type.base}.schema,`,
        `}), {})`,
        `)`,
        `)`
    ].join(EOL);
}
