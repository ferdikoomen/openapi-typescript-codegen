import type { Model } from '../client/interfaces/Model';

import { postProcessModelEnum } from './postProcessModelEnum.js';
import { postProcessModelEnums } from './postProcessModelEnums.js';
import { postProcessModelImports } from './postProcessModelImports.js';

/**
 * Post processes the model.
 * This will clean up any double imports or enum values.
 * @param model
 */
export const postProcessModel = (model: Model): Model => {
    return {
        ...model,
        imports: postProcessModelImports(model),
        enums: postProcessModelEnums(model),
        enum: postProcessModelEnum(model),
    };
};
