export interface ModelProperty {
    name: string;
    type: string;
    base: string;
    template: string | null;
    readOnly: boolean;
    required: boolean;
    nullable: boolean;
    description: string | null;
    validation: string | null;
}
