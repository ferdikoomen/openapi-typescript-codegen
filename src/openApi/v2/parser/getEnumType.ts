export function getEnumType(values?: string[], addParentheses = false): string {
    if (Array.isArray(values)) {
        // Filter out empty and double enum values.
        // Plus make sure we put quotes around strings!
        const entries: string[] = values
            .filter(name => name)
            .filter((name: string, index: number, arr: string[]) => {
                return arr.indexOf(name) === index;
            })
            .map(value => `'${String(value)}'`);

        // Add grouping parentheses if needed. This can be handy if enum values
        // are used in Arrays, so that you will get the following definition:
        // const myArray: ('EnumValue1' | 'EnumValue2' | 'EnumValue3')[];
        if (entries.length > 1 && addParentheses) {
            return `(${entries.join(' | ')})`;
        }

        return entries.join(' | ');
    }
    return 'string';
}
