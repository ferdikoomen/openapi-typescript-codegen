import type { Model } from '../client/interfaces/Model';

/**
 * Set unique enum values for the model
 * @param model The model that is post-processed
 */
export const postProcessModelEnums = (model: Model): Model[] => {
    return model.enums.reduce<Model[]>((enums, property) => {
        const existing = enums.find(item => item.name === property.name);
        if (!existing) {
            enums.push({
                ...property,
                enum: [...property.enum],
            });
            return enums;
        }

        existing.enum = existing.enum.concat(
            property.enum.filter(enumerator => !existing.enum.some(item => item.name === enumerator.name))
        );

        return enums;
    }, []);
};
