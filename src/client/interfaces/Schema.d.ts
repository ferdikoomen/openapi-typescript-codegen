import { Shape } from './Symbol';
import { SchemaProperty } from './SchemaProperty';

export interface Schema {
    isInterface: boolean; // Schema is interface
    isType: boolean; // Schema is type
    isEnum: boolean; // Schema is enum
    name: string;
    type: string;
    base: string;
    template: string | null;
    description?: string;
    extends: string[];
    imports: string[];
    symbols: Shape[]; // TODO: Betere naam!
    properties: SchemaProperty[];
}
