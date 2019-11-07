export interface Schema {
    type: string;
    base: string;
    template: string | null;
    default?: any;
    imports: string[];
}
