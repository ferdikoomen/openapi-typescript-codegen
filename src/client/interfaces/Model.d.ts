import { Enum } from './Enum';
import { Validation } from './Validation';

export interface Model {
    name: string;
    type: string;
    base: string;
    link: Model | null;
    template: string | null;
    description: string | null;
    readOnly: boolean;
    required: boolean;
    nullable: boolean;
    imports: string[];
    extends: string[];
    enum: Enum[];
    enums: Model[];
    properties: Model[];
    validation: Validation | null;
}
