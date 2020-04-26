import { Client } from '../client/interfaces/Client';
import { Operation } from '../client/interfaces/Operation';
import { Service } from '../client/interfaces/Service';
import { flatMap } from './flatMap';
import { postProcessUnionTypes } from './postProcessUnionTypes';

export function postProcessServiceOperations(service: Service, client: Client, useUnionTypes: boolean = false): Operation[] {
    const names = new Map<string, number>();

    return service.operations.map(operation => {
        const clone = { ...operation };

        // Parse the service parameters and results, very similar to how we parse
        // properties of models. These methods will extend the type if needed.
        clone.parameters = clone.parameters.map(parameter => postProcessUnionTypes(parameter, client, useUnionTypes));
        clone.results = clone.results.map(result => postProcessUnionTypes(result, client, useUnionTypes));
        clone.imports.push(...flatMap(clone.parameters, parameter => parameter.imports));
        clone.imports.push(...flatMap(clone.results, result => result.imports));

        // Check if the operation name is unique, if not then prefix this with a number
        const name = clone.name;
        const index = names.get(name) || 0;
        if (index > 0) {
            clone.name = `${name}${index}`;
        }
        names.set(name, index + 1);

        return clone;
    });
}
