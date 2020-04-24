import { Client } from '../client/interfaces/Client';
import { Model } from '../client/interfaces/Model';
import { flatMap } from './flatMap';
import { unique } from './unique';

/**
 * Get the full list of models that are extended by the given model.
 * This list is used when we have the flag "useUnionTypes" enabled.
 * @param model
 * @param client
 */
export function getExtendedByList(model: Model, client: Client): Model[] {
    const extendedBy = client.models.filter(ref => {
        const names = model.isDefinition ? [model.name] : model.base.split(' | ');
        return names.find(name => {
            return ref.extends.includes(name);
        });
    });

    if (extendedBy.length) {
        extendedBy.push(...flatMap(extendedBy, ref => getExtendedByList(ref, client)));
    }
    return extendedBy.filter(unique);
}
