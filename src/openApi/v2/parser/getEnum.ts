import { Enum } from '../../../client/interfaces/Enum';

export function getEnum(values?: (string | number)[]): Enum[] {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
                return arr.indexOf(value) === index;
            })
            .map(value => {
                if (typeof value === 'number') {
                    return {
                        name: `NUM_${value}`,
                        value: String(value),
                    };
                }
                return {
                    name: value.replace(/([a-z])([A-Z]+)/g, '$1_$2').toUpperCase(),
                    value: `'${value}'`,
                };
            });
    }
    return [];
}
