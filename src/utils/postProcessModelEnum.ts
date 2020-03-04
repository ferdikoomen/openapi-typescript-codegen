import { Enum } from '../client/interfaces/Enum';
import { Model } from '../client/interfaces/Model';

/**
 * Set unique enum values for the model
 * @param model
 */
export function postProcessModelEnum(model: Model): Enum[] {
    return model.enum.filter((property, index, arr) => {
        return arr.findIndex(item => item.name === property.name) === index;
    });
}
