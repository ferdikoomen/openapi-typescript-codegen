import type { Enum } from '../../../client/interfaces/Enum';
import { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getOneOfEnum = (oneOf: OpenApiSchema[]): Enum[] =>
    oneOf.reduce((enums, item) => {
        if (typeof item.const === 'number') {
            enums.push({
                value: String(item.const),
                name: `${item.title}` || `'_${item.const}'`,
                type: 'number',
                description: item.description || item.title || null,
            });
        } else {
            enums.push({
                value: `'${item.const}'`,
                name: `${item.title}` || `'${item.const}'`,
                type: 'string',
                description: item.description || item.title || null,
            });
        }
        return enums;
    }, [] as Enum[]);
