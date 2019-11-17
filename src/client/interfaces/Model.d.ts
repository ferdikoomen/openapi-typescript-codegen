import { Enum } from './Enum';
import { Validation } from './Validation';

export interface Model {
    name: string;
    type: string;
    base: string;
    template?: string;
    description?: string;
    readOnly?: boolean;
    required?: boolean;
    nullable?: boolean;
    imports: string[];
    extends: string[];
    enum: Enum[];
    enums: Model[];
    properties: Model[];
    validation?: Validation;
}
