import { Enum } from '../../../client/interfaces/Enum';
import { getEnumValues } from './getEnumValues';

export function getEnumType(enumerators: Enum[], addParentheses: boolean = false): string {
    // Fetch values from the symbols, just to be sure we filter out
    // any double values and finally we sort them to make them easier
    // to read when we use them in our generated code.
    const values = getEnumValues(enumerators);

    // Add grouping parentheses if needed. This can be handy if enum values
    // are used in Arrays, so that you will get the following definition:
    // const myArray: ('EnumValue1' | 'EnumValue2' | 'EnumValue3')[];
    if (values.length > 1 && addParentheses) {
        return `(${values.join(' | ')})`;
    }

    return values.join(' | ');
}
