import { Service } from '../client/interfaces/Service';

/**
 * Convert a given Map to an Array and sort the result the service base name.
 * @param services Map of Service objects.
 */
export function getSortedServices(services: Map<string, Service>): Service[] {
    return (
        Array.from(services.values()).sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        }) || []
    );
}
