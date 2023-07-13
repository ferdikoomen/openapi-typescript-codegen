import type { Model } from '../../../client/interfaces/Model';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getModelDefault = (definition: OpenApiSchema, model?: Model): string | undefined => {
    if (definition.default === undefined) {
        return undefined;
    }

    if (definition.default === null) {
        return 'null';
    }

    const type = definition.type || typeof definition.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number': {
            const defDefault = definition.default as number;
            if (model?.export === 'enum' && model.enum[defDefault]) {
                return model.enum[defDefault].value;
            }
            return defDefault.toString();
        }

        case 'boolean':
            return JSON.stringify(definition.default);

        case 'string':
            return `'${definition.default}'`;

        case 'object':
            try {
                return JSON.stringify(definition.default, null, 4);
            } catch (e) {
                // Ignore
            }
    }

    return undefined;
};
