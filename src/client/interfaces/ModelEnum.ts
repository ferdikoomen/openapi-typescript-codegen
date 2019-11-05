import { ModelEnumProperty } from './ModelEnumProperty';

export interface ModelEnum {
    name: string;
    value: string;
    values: ModelEnumProperty[];
}
