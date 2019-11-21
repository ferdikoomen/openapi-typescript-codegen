import { Service } from '../client/interfaces/Service';

export function getServiceNames(services: Map<string, Service>): string[] {
    return Array.from(services.values())
        .map(service => service.name)
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
