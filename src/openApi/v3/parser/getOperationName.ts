import camelCase from 'camelcase';

/**
 * Convert the input value to a correct operation (method) classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
export function getOperationName(value: string): string {
    const parts = value.split('.');
    if (parts.length === 2) value = parts[1];
    
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase(clean);
}
