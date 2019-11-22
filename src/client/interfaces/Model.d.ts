import { Enum } from './Enum';
import { Schema } from './Schema';

export interface Model extends Schema {
    name: string;
    isProperty: boolean;
    isReadOnly: boolean;
    isRequired: boolean;
    isNullable: boolean;
    extends: string[];
    enum: Enum[];
    enums: Model[];
    properties: Model[];
}
