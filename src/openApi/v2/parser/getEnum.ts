import { Enum } from '../../../client/interfaces/Enum';
import { PrimaryType } from './constants';

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
                        type: PrimaryType.NUMBER,
                        description: null,
                    };
                }
                return {
                    name: value.replace(/([a-z])([A-Z]+)/g, '$1_$2').toUpperCase(),
                    value: `'${value}'`,
                    type: PrimaryType.STRING,
                    description: null,
                };
            });
    }
    return [];
}
