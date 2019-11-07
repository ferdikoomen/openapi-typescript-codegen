export interface Parameter {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    name: string;
    type: string;
    base: string;
    template: string | null;
    description?: string;
    default?: any;
    required: boolean;
    nullable: boolean;
    imports: string[];
}
