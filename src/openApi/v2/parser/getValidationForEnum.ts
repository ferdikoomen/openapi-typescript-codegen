import { Enum } from '../../../client/interfaces/Enum';
import { EOL } from 'os';

export function getValidationForEnum(name: string, enumerators: Enum[]): string {
    return [
        `yup.mixed${name ? `<${name}>` : ''}().oneOf([`,
        ...enumerators.map(enumerator => {
            if (name) {
                return `${name}.${enumerator.name},`;
            } else {
                return `${enumerator.value},`;
            }
        }),
        `])`,
    ].join(EOL);
}
