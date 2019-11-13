import camelCase from 'camelcase';

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
export function getParameterName(value: string): string {
    const clean: string = value.replace(/[^\w\s\-]+/g, '_').trim();
    return camelCase(clean);
}
