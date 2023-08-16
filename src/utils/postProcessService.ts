import type { Service } from '../client/interfaces/Service';

import { postProcessServiceImports } from './postProcessServiceImports.js';
import { postProcessServiceOperations } from './postProcessServiceOperations.js';

export const postProcessService = (service: Service): Service => {
    const clone = { ...service };
    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone);
    return clone;
};
