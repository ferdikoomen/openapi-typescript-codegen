import { Model } from '../../../client/interfaces/Model';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';

export function getModelDefault(definition: OpenApiSchema, model?: Model): string | null {
    if (definition.default === null) {
        return 'null';
    }

    switch (typeof definition.default) {
        case 'number':
            if (model && model.export == 'enum' && model.enum.length && model.enum[definition.default]) {
                return model.enum[definition.default].value;
            }
            return JSON.stringify(definition.default);

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

    return null;
}
