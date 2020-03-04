import { Client } from '../client/interfaces/Client';
import { Operation } from '../client/interfaces/Operation';
import { Service } from '../client/interfaces/Service';
import { postProcessUnionTypes } from './postProcessUnionTypes';

export function postProcessServiceOperations(service: Service, client: Client, useUnionTypes: boolean = false): Operation[] {
    const names = new Map<string, number>();

    return service.operations.map(operation => {
        const clone = { ...operation };

        // Parse the service parameters and results, very similar to how we parse
        // properties of models. These methods will extend the type if needed.
        clone.parameters = clone.parameters.map(parameter => postProcessUnionTypes(parameter, client, useUnionTypes));
        clone.results = clone.results.map(result => postProcessUnionTypes(result, client, useUnionTypes));
        clone.imports.push(...clone.parameters.flatMap(parameter => parameter.imports));
        clone.imports.push(...clone.results.flatMap(result => result.imports));

        // Check of the operation name
        let name = clone.name;
        const index = names.get(name) || 0;
        if (index > 0) {
            clone.name = `${name}${index}`;
            name = `${name}${index}`;
        }
        names.set(name, index + 1);

        return clone;
    });
}
