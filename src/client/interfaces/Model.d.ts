import { ModelProperty } from './ModelProperty';
import { Enum } from './Enum';
import { EnumSymbol } from './EnumSymbol';

export interface Model {
    isInterface: boolean;
    isType: boolean;
    isEnum: boolean;
    name: string;
    type: string;
    base: string;
    template: string | null;
    validation: string | null;
    description: string | null;
    extends: string[];
    imports: string[];
    enums: Enum[];
    symbols: EnumSymbol[];
    properties: ModelProperty[];
}
