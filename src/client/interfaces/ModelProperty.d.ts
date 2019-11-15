export interface ModelProperty {
    name: string;
    type: string;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    description: string | null;
    validation: string | null;
}
