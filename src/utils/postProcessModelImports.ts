import type { Model } from '../client/interfaces/Model';

import { sort } from './sort.js';
import { unique } from './unique.js';

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
export const postProcessModelImports = (model: Model): string[] => {
    return model.imports
        .filter(unique)
        .sort(sort)
        .filter(name => model.name !== name);
};
