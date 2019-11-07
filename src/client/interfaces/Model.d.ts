import { ModelProperty } from './ModelProperty';
import { ModelEnum } from './ModelEnum';

export interface Model {
    name: string;
    base: string;
    type: string;
    template: string | null;
    description?: string;
    extends: string[];
    imports: string[];
    properties: ModelProperty[];
    enums: ModelEnum[];
}
