import { getType } from './getType';
import { PrimaryType } from './constants';
import { OpenApiItems } from '../interfaces/OpenApiItems';

export interface ArrayType {
    type: string;
    base: string;
    template?: string;
    default?: any;
    imports: string[];
}

export function getArrayType(items: OpenApiItems): ArrayType {
    const result: ArrayType = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        default: items.default,
        imports: [],
    };

    // If the parameter has a type than it can be a basic or generic type.
    if (items.type) {
        const itemsType = getType(items.type);
        result.type = itemsType.type;
        result.base = itemsType.base;
        result.template = itemsType.template;
        result.imports.push(...itemsType.imports);

        // If the parameter is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (items.type === 'array' && items.items) {
            const arrayType = getArrayType(items.items);
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
