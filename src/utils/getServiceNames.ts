import { Service } from '../client/interfaces/Service';

export function getServiceNames(services: Service[]): string[] {
    return services
        .map(service => service.name)
        .sort((a, b) => {
            const nameA = a.toLowerCase();
            const nameB = b.toLowerCase();
            return nameA.localeCompare(nameB, 'en');
        });
}
