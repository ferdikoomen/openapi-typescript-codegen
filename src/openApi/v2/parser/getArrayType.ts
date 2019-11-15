import { getType } from './getType';
import { PrimaryType } from './constants';
import { Type } from '../../../client/interfaces/Type';
import { OpenApiItems } from '../interfaces/OpenApiItems';

export interface ArrayType {
    type: string;
    base: string;
    template: string | null;
    default: any | undefined;
    imports: string[];
}

export function getArrayType(items: OpenApiItems): ArrayType {
    const result: ArrayType = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        default: items.default,
        imports: [],
    };

    // If the parameter has a type than it can be a basic or generic type.
    if (items.type) {
        const itemsType: Type = getType(items.type);
        result.type = itemsType.type;
        result.base = itemsType.base;
        result.template = itemsType.template;
        result.imports.push(...itemsType.imports);

        // If the parameter is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (items.type === 'array' && items.items) {
            const arrayType: ArrayType = getArrayType(items.items);
            result.type = `${arrayType.type}[]`;
            result.base = arrayType.base;
            result.template = arrayType.template;
            result.imports.push(...arrayType.imports);
        }
    }

    // if (items.enum) {
    //     result.type = getEnumType(items.enum, true);
    //     result.base = 'string';
    //     result.imports = [];
    // }

    return result;
}
