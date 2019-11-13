export interface SchemaReference {
    type: string;
    base: string;
    template: string | null;
    imports: string[];
}
