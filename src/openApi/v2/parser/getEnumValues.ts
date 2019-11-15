export function getEnumValues(symbols: ModelSymbol[]): string[] {
    // Fetch values from the symbols, just to be sure we filter out
    // any double values and finally we sort them to make them easier
    // to read when we use them in our generated code.
    return symbols
        .map(symbol => symbol.value)
        .filter((value: string, index: number, arr: string[]): boolean => {
            return arr.indexOf(value) === index;
        })
        .sort();
}
