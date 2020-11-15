import { PrimaryType, TYPE_MAPPINGS } from './constants';

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
export function getMappedType(type: string): PrimaryType | undefined {
    return TYPE_MAPPINGS.get(type);
}

export function hasMappedType(type: string): boolean {
    return TYPE_MAPPINGS.has(type);
}
