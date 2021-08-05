import type { Service } from '../client/interfaces/Service';
import { postProcessServiceImports } from './postProcessServiceImports';
import { postProcessServiceOperations } from './postProcessServiceOperations';

export function postProcessService(service: Service, exportClient: boolean): Service {
    const clone = { ...service };
    clone.operations = postProcessServiceOperations(clone, exportClient);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone);
    return clone;
}
