export interface OperationParameter {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    name: string;
    type: string;
    base: string;
    template: string | null;
    description: string | null;
    default: any | undefined;
    required: boolean;
    nullable: boolean;
    imports: string[];
}
