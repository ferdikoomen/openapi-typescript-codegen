import { ModelProperty } from './ModelProperty';
import { ModelEnum } from './ModelEnum';

export interface Model {
    name: string;
    base: string;
    type: string;
    template?: string;
    description?: string;
    extends: string[];
    imports: string[];
    properties: ModelProperty[];
    enums: ModelEnum[];
}
