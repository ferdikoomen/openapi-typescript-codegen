export function getEnumType(symbols: ModelSymbol[], addParentheses = false): string {
    // Fetch values from the symbols, just to be sure we filter out
    // any double values and finally we sort them to make them easier
    // to read when we use them in our generated code.
    const entries: string[] = getEnumValues(symbols);

    // Add grouping parentheses if needed. This can be handy if enum values
    // are used in Arrays, so that you will get the following definition:
    // const myArray: ('EnumValue1' | 'EnumValue2' | 'EnumValue3')[];
    if (entries.length > 1 && addParentheses) {
        return `(${entries.join(' | ')})`;
    }

    return entries.join(' | ');
}
