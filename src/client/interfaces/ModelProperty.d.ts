export interface ModelProperty {
    name: string;
    type: string;
    base: string;
    template: string | null;
    description: string | null;
    required: boolean;
    readOnly: boolean;
    imports: string[];
}
