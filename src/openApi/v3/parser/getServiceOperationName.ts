import camelCase from 'camelcase';

/**
 * Convert the input value to a correct operation (method) classname. This converts
 * the input string to cascalCase, so the method name follows the most popular
 * Javascript and Typescript writing style.
 * @param value
 */
export function getServiceOperationName(value: string): string {
    return camelCase(value);
}
