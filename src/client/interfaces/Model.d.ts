import { Enum } from './Enum';

export interface Model {
    name: string;
    export: 'reference' | 'generic' | 'enum' | 'array' | 'dictionary' | 'interface';
    type: string;
    base: string;
    template: string | null;
    link: Model | null;
    description: string | null;
    readOnly: boolean;
    required: boolean;
    nullable: boolean;
    imports: string[];
    extends: string[];
    enum: Enum[];
    enums: Model[];
    properties: Model[];
}
