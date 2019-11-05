/**
 * Check if given type is a primary type.
 * @param type
 */
export function isPrimaryType(type: string): boolean {
    switch (type.toLowerCase()) {
        case 'number':
        case 'boolean':
        case 'string':
        case 'object':
        case 'any':
        case 'void':
        case 'null':
            return true;
    }
    return false;
}
