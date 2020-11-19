import type { ModelComposition } from '../../../client/interfaces/ModelComposition';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { getModel } from './getModel';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export function getModelComposition(openApi: OpenApi, definitions: OpenApiSchema[], type: 'one-of' | 'any-of' | 'all-of', getModel: GetModelFn): ModelComposition {
    const composition: ModelComposition = {
        type,
        imports: [],
        enums: [],
        properties: [],
    };

    const modes = definitions.map(definition => getModel(openApi, definition));
    modes.forEach(model => {
        composition.imports.push(...model.imports);
        composition.enums.push(...model.enums);
        composition.properties.push(model);
    });

    return composition;
}
