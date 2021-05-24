export function escapeDescription(value: string): string {
    return value.replace(/(?<!\\)`/g, '\\`').replace(/(\*\/)/g, '*_/');
}
