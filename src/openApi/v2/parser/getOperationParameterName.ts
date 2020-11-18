import camelCase from 'camelcase';

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
export function getOperationParameterName(value: string): string {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase(clean);
}
