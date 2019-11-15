import { EnumValue } from './EnumValue';

export interface Enum {
    name: string;
    type: string;
    values: EnumValue[];
}
