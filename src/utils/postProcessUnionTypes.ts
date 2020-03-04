import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { getExtendedByList } from './getExtendedByList';

/**
 * This post processor will convert types to union types. For more information
 * please check the documentation. In a nutshell: By setting the "useUnionTypes"
 * flag we will convert base types to a union of types that are extended from
 * the base type.
 * @param model
 * @param client
 * @param useUnionTypes
 */
export function postProcessUnionTypes<T extends Model>(model: T, client: Client, useUnionTypes: boolean): T {
    const clone = { ...model };

    if (useUnionTypes) {
        // If this is not a root definition, then new need to check the base type
        if (!clone.isDefinition) {
            const extendedBy = getExtendedByList(clone, client);
            const extendedByNames = extendedBy.map(m => m.name);
            clone.base = [clone.base, ...extendedByNames].sort().join(' | ');
            clone.imports = clone.imports.concat(...extendedByNames);
        }

        // In any case we need to check the properties of a model.
        // When the types get extended, we also need to make sure we update the imports.
        clone.properties = clone.properties.map(property => postProcessUnionTypes(property, client, useUnionTypes));
        clone.properties.forEach(property => {
            clone.imports.push(...property.imports);
        });

        // When the model has a link (in case of an Array or Dictionary),
        // then we also process this linked model and again update the imports.
        clone.link = clone.link ? postProcessUnionTypes(clone.link, client, useUnionTypes) : null;
        if (clone.link) {
            clone.imports.push(...clone.link.imports);
        }
    }
    return clone;
}
