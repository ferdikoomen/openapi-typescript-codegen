import camelCase from 'camelcase';

/**
 * Convert the input value to a correct service classname. This converts
 * the input string to PascalCase and appends the "Service" prefix if needed.
 */
export function getServiceClassName(value: string): string {
    const clean = value.replace(/[^\w\s\-]+/g, '-').trim();
    const name = camelCase(clean, { pascalCase: true });
    if (name && !name.endsWith('Service')) {
        return `${name}Service`;
    }
    return name;
}
