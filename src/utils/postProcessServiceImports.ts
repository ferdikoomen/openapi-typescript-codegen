import type { Service } from '../client/interfaces/Service';

import { sort } from './sort.js';
import { unique } from './unique.js';

/**
 * Set unique imports, sorted by name
 * @param service
 */
export const postProcessServiceImports = (service: Service): string[] => {
    return service.imports.filter(unique).sort(sort);
};
