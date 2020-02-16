import { Enum } from '../../../client/interfaces/Enum';
import { WithEnumExtension } from '../interfaces/Extensions/WithEnumExtension';

const KEY_ENUM_NAMES = 'x-enum-varnames';
const KEY_ENUM_DESCRIPTIONS = 'x-enum-descriptions';

export function extendEnum(enumerators: Enum[], definition: WithEnumExtension): Enum[] {
    const names = definition[KEY_ENUM_NAMES];
    const descriptions = definition[KEY_ENUM_DESCRIPTIONS];

    return enumerators.map((enumerator, index) => ({
        name: (names && names[index]) || enumerator.name,
        description: (descriptions && descriptions[index]) || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
}
