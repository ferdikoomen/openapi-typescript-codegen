import { PrimaryType, TYPE_MAPPINGS } from './constants';

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
export function getMappedType(type: string): PrimaryType | string {
    const mapped = TYPE_MAPPINGS.get(type.toLowerCase());
    if (mapped) {
        return mapped;
    }
    return type;
}

export function hasMappedType(type: string): boolean {
    return TYPE_MAPPINGS.has(type.toLowerCase());
}
