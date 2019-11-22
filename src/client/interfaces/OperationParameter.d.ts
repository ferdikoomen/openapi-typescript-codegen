import { Enum } from './Enum';
import { Schema } from './Schema';

export interface OperationParameter extends Schema {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    name: string;
    default: any;
    isRequired: boolean;
    isNullable: boolean;
    enum: Enum[];
}
