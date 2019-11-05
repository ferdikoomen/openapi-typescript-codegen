import { ModelProperty } from './ModelProperty';
import { ModelEnum } from './ModelEnum';

export interface Model {
    name: string;
    base: string;
    type: string;
    template: string;
    description: string | null;
    extends: string | null;
    imports: string[];
    properties: ModelProperty[];
    enums: ModelEnum[];
}
