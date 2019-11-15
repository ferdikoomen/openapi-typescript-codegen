export interface ModelProperty {
    name: string;
    type: string;
    required: boolean;
    nullable: boolean;
    readOnly: boolean;
    validation: string | null;
    description: string | null;
}
