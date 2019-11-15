import { Enum } from '../../../client/interfaces/Enum';

export function getModelEnum(): Enum {
    const prop: Enum = {
        name: '',
        type: '',
        values: [],
        validation: null,
    };

    return prop;
}
