import { EnumSymbol } from '../../../client/interfaces/EnumSymbol';

export function getEnumSymbols(values?: (string | number)[]): EnumSymbol[] {
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
