import { getType } from './getType';
import { Type } from '../../../client/interfaces/Type';
import { OpenApiItems } from '../interfaces/OpenApiItems';
import { getEnumType } from './getEnumType';
import { ArrayType } from '../../../client/interfaces/ArrayType';

export function getArrayType(items: OpenApiItems): ArrayType {
    let itemsType = 'any';
    let itemsBase = 'any';
    let itemsTemplate: string | null = null;
    const itemsImports: string[] = [];

    // If the parameter has a type than it can be a basic or generic type.
    if (items.type) {
        const itemsData: Type = getType(items.type);
        itemsType = itemsData.type;
        itemsBase = itemsData.base;
        itemsTemplate = itemsData.template;
        itemsImports.push(...itemsData.imports);

        // If the parameter is an Array type, we check for the child type,
        // so we can create a typed array, otherwise this will be a "any[]".
        if (items.type === 'array' && items.items) {
            console.log('templated array', items.items);
            // Parse the child types and create a correct Array type, for example "string[]" or "ActivityData[]"
            // const child: ParsedProperty = parseProperty(parameter.items, template);
            // parameterType = `${child.type}[]`;
            // parameterBase = child.base;
            // parameterTemplate = child.template;
            // parameterImports.push(...child.imports);
        }
    }

    if (items.enum) {
        itemsType = getEnumType(items.enum, true);
    }

    return {
        type: itemsType,
        base: itemsBase,
        template: itemsTemplate,
        default: items.default,
        imports: itemsImports,
    };
}
