export interface SchemaProperty {
    name: string;
    type: string;
    base: string;
    template: string | null;
    description?: string;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    extends: string[];
    imports: string[];
    properties: Map<string, SchemaProperty>;
}
