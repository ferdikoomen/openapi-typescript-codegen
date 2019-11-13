import { Service } from '../client/interfaces/Service';
import { getSortedImports } from './getSortedImports';
import { Operation } from '../client/interfaces/Operation';

export function cleanupServices(services: Map<string, Service>): Map<string, Service> {
    services.forEach((service: Service): void => {
        const names: Map<string, number> = new Map<string, number>();

        service.imports = getSortedImports(service.imports);

        // Append postfix number to duplicate operation names and sort them.
        service.operations = service.operations
            .map(
                (operation: Operation): Operation => {
                    const name: string = operation.name;
                    const index: number = names.get(name) || 0;
                    if (index > 0) {
                        operation.name = `${name}${index}`;
                    }
                    names.set(name, index + 1);
                    return operation;
                }
            )
            .sort((a: Operation, b: Operation): number => {
                const nameA: string = a.name.toLowerCase();
                const nameB: string = b.name.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    });
    return services;
}
