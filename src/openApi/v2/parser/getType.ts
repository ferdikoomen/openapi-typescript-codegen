import { stripNamespace } from './stripNamespace';
import { Type } from '../../../client/interfaces/Type';
import { getMappedType, hasMappedType } from './getMappedType';
import { PrimaryType } from './constants';

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param template Optional template class from parent (needed to process generics)
 */
export function getType(value: string | undefined, template: string | null = null): Type {
    const result: Type = {
        type: PrimaryType.OBJECT,
        base: PrimaryType.OBJECT,
        template: null,
        imports: [],
    };

    // Remove definitions prefix and cleanup string.
    const valueClean: string = stripNamespace(value || '');

    // Check of we have an Array type or generic type, for instance: "Link[Model]".
    if (/\[.*\]$/g.test(valueClean)) {
        const matches: RegExpMatchArray | null = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches && matches.length) {
            // Both of the types can be complex types so parse each of them.
            const match1: Type = getType(matches[1]);
            const match2: Type = getType(matches[2]);

            // If the first match is a generic array then construct a correct array type,
            // for example the type "Array[Model]" becomes "Model[]".
            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = `${match2.type}`;
                match1.imports = [];
            } else if (match2.type === '') {
                // Primary types like number[] or string[]
                result.type = match1.type;
                result.base = match1.type;
                result.template = match1.type;
                match2.imports = [];
            } else {
                result.type = `${match1.type}<${match2.type}>`;
                result.base = match1.type;
                result.template = match2.type;
            }

            // Either way we need to add the found imports
            result.imports.push(...match1.imports);
            result.imports.push(...match2.imports);
        }
    } else if (hasMappedType(valueClean)) {
        const mapped: string = getMappedType(valueClean);
        result.type = mapped;
        result.base = mapped;
    } else if (valueClean) {
        result.type = valueClean;
        result.base = valueClean;
        result.imports.push(valueClean);
    }

    // If the property that we found matched the parent template class
    // Then ignore this whole property and return it as a "T" template property.
    if (result.type === template) {
        result.type = 'T'; // Template;
        result.base = 'T'; // Template;
        result.imports = [];
    }

    return result;
}
