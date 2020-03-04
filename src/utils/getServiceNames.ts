import { Service } from '../client/interfaces/Service';
import { sort } from './sort';

export function getServiceNames(services: Service[]): string[] {
    return services.map(service => service.name).sort(sort);
}
