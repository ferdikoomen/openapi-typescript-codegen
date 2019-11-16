import { Service } from '../client/interfaces/Service';

export function getSortedServices(services: Map<string, Service>): string[] {
    return Array.from(services.values())
        .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        })
        .map(service => service.name);
}
