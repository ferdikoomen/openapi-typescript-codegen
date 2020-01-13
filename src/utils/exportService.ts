import { Service } from '../client/interfaces/Service';

export function exportService(service: Service): Service {
    const names = new Map<string, number>();
    return {
        ...service,
        imports: service.imports
            .filter(name => {
                return service.name !== name;
            })
            .filter((name, index, arr) => {
                return arr.indexOf(name) === index;
            })
            .sort((a, b) => {
                const nameA = a.toLowerCase();
                const nameB = b.toLowerCase();
                return nameA.localeCompare(nameB);
            }),
        operations: service.operations.map(operation => {
            const name = operation.name;
            const index = names.get(name) || 0;
            if (index > 0) {
                operation.name = `${name}${index}`;
            }
            names.set(name, index + 1);
            return operation;
        }),
    };
}
