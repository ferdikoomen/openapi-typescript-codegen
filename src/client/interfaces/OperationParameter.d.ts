import { Model } from './Model';
import { Enum } from './Enum';

export interface OperationParameter {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    name: string;
    export: 'reference' | 'generic' | 'enum' | 'array' | 'dictionary' | 'interface';
    type: string;
    base: string;
    template: string | null;
    description: string | null;
    required: boolean;
    nullable: boolean;
    imports: string[];
    enum: Enum[];
    model: Model | null;
    default: any;
}
