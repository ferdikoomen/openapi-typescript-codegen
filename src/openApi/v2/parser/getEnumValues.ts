import { EnumSymbol } from '../../../client/interfaces/EnumSymbol';

export function getEnumValues(symbols: EnumSymbol[]): string[] {
    // Fetch values from the symbols, just to be sure we filter out
    // any double values and finally we sort them to make them easier
    // to read when we use them in our generated code.
    return symbols
        .map(symbol => symbol.value)
        .filter((symbol, index, arr) => {
            return arr.indexOf(symbol) === index;
        })
        .sort();
}
