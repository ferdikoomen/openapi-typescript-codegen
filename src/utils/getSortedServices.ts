import { Service } from '../client/interfaces/Service';

export function getSortedServices(services: Service[]): Service[] {
    return services.sort((a, b) => {
        const nameA: string = a.name.toLowerCase();
        const nameB: string = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
