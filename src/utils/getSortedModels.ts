import { Model } from '../client/interfaces/Model';

/**
 * Convert a given Map to an Array and sort the result the Model base name.
 * @param models Map of Model objects.
 */
export function getSortedModels(models: Map<string, Model>): Model[] {
    return (
        Array.from(models.values()).sort((a, b) => {
            const nameA = a.base.toLowerCase();
            const nameB = b.base.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        }) || []
    );
}
