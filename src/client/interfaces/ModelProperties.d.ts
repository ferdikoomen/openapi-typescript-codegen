import { ModelProperty } from './ModelProperty';
import { ModelEnum } from './ModelEnum';

export interface ModelProperties {
    imports: string[];
    properties: ModelProperty[];
    enums: ModelEnum[];
}
