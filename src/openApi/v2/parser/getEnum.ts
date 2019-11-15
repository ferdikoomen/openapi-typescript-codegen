import { ModelEnumValue } from '../../../client/interfaces/ModelEnumValue';

export function getModelEnum(values?: (string | number)[]): ModelEnumValue[] {
    if (Array.isArray(values)) {
        return values
            .filter((value: string | number, index: number, arr: (string | number)[]) => {
                return arr.indexOf(value) === index;
            })
            .map(
                (value: string | number): ModelEnumValue => {
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
                }
            );
    }
    return [];
}
