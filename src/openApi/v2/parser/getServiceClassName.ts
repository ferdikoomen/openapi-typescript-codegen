import camelCase from 'camelcase';

/**
 * Convert the input value to a correct service classname. This converts
 * the input string to PascalCase and appends the "Service" prefix if needed.
 * @param value
 */
export function getServiceClassName(value: string): string {
    const name = camelCase(value, { pascalCase: true });
    if (name && !name.endsWith('Service')) {
        return `${name}Service`;
    }
    return name;
}
