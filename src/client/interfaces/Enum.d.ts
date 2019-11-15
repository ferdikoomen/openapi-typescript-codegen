import { EnumSymbol } from './EnumSymbol';

export interface Enum {
    name: string;
    type: string;
    symbols: EnumSymbol[];
    validation: string | null;
}
