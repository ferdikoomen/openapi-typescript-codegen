import { ModelProperty } from '../../../client/interfaces/ModelProperty';

export function parseModelProperty(): ModelProperty {
    return {
        name: '',
        type: '',
        base: '',
        template: '',
        description: null,
        required: false,
        readOnly: false,
        imports: [],
    };
}
