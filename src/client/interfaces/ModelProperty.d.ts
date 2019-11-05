export interface ModelProperty {
    name: string;
    type: string;
    base: string;
    template?: string;
    description?: string;
    default?: any;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    extends: string[];
    imports: string[];
    properties: ModelProperty[];
}
