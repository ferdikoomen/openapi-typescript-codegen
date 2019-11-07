import { ModelEnumValue } from './ModelEnumValue';

export interface ModelEnum {
    name: string;
    value: string;
    values: ModelEnumValue[];
}
