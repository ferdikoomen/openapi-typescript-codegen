export interface OperationParameter {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    name: string;
    type: string;
    base: string;
    template?: string;
    description?: string;
    default?: any;
    required: boolean;
    nullable: boolean;
    imports: string[];
}
