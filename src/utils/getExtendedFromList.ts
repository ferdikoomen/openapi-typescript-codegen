import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { flatMap } from './flatMap';
import { unique } from './unique';

/**
 * Get the full list of models that are extended from the given model.
 * This list is used when we have the flag "useUnionTypes" enabled.
 * @param model
 * @param client
 */
export function getExtendedFromList(model: Model, client: Client): Model[] {
    const extendedFrom = client.models.filter(ref => {
        const names = ref.isDefinition ? [ref.name] : ref.base.split(' | ');
        return names.find(name => {
            return model.extends.includes(name);
        });
    });

    if (extendedFrom.length) {
        extendedFrom.push(...flatMap(extendedFrom, ref => getExtendedFromList(ref, client)));
    }
    return extendedFrom.filter(unique);
}
