import camelCase from 'camelcase';

/**
 * Convert the input value to a correct operation (method) classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
export function getOperationName(value: string): string {
    const clean = value.replace(/[^\w\s\-]+/g, '-').trim();
    return camelCase(clean);
}
