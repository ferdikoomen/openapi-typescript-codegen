import { Language } from '../index';
import { Service } from '../client/interfaces/Service';

export function getFilteredServices(services: Service[], language: Language): Service[] {
    return services.filter(service => {
        if (language === Language.JAVASCRIPT) {
            return service.operations.length > 0;
        }
        return service.operations.length;
    });
}
