import { SchemaProperty } from './SchemaProperty';

export interface Schema {
    type: string;
    base: string;
    template: string | null;
    description?: string;
    default?: any;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    extends: string[];
    imports: string[];
    properties: Map<string, SchemaProperty>;
}
