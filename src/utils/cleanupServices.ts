import { Service } from '../client/interfaces/Service';
import { getSortedImports } from './getSortedImports';

export function cleanupServices(services: Service[]): Service[] {
    services.forEach(service => {
        const names = new Map<string, number>();

        service.imports = getSortedImports(service.imports).filter(name => {
            return service.name !== name;
        });

        service.operations = service.operations
            .map(operation => {
                const name = operation.name;
                const index = names.get(name) || 0;
                if (index > 0) {
                    operation.name = `${name}${index}`;
                }
                names.set(name, index + 1);
                return operation;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    });
    return services;
}
