export interface SchemaProperty {
    name: string;
    type: string;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    description?: string;
}
