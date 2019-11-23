import { Enum } from '../../../client/interfaces/Enum';

export function getEnumValues(enumerators: Enum[]): string[] {
    // Fetch values from the symbols, just to be sure we filter out
    // any double values and finally we sort them to make them easier
    // to read when we use them in our generated code.
    return enumerators
        .map(enumerator => enumerator.value)
        .filter((enumerator, index, arr) => {
            return arr.indexOf(enumerator) === index;
        })
        .sort();
}
