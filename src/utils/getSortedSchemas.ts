import { Schema } from '../client/interfaces/Schema';

/**
 * Convert a given Map to an Array and sort the result the Schema base name.
 * @param schemas Map of Schema objects.
 */
export function getSortedSchemas(schemas: Map<string, Schema>): Schema[] {
    return (
        Array.from(schemas.values()).sort((a, b) => {
            const nameA = a.base.toLowerCase();
            const nameB = b.base.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        }) || []
    );
}
