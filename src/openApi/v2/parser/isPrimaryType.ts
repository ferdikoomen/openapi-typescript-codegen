import { PrimaryType } from './constants';

/**
 * Check if given type is a primary type.
 * @param type
 */
export function isPrimaryType(type: string): type is PrimaryType {
    switch (type.toLowerCase()) {
        case PrimaryType.FILE:
        case PrimaryType.OBJECT:
        case PrimaryType.BOOLEAN:
        case PrimaryType.NUMBER:
        case PrimaryType.STRING:
        case PrimaryType.VOID:
        case PrimaryType.NULL:
            return true;
    }
    return false;
}
