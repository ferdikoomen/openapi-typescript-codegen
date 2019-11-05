export interface ServiceOperationParameter {
    name: string;
    type: string;
    base: string;
    template: string;
    description: string;
    default?: any;
    required: boolean;
    nullable: boolean;
    // extends: string[];
    // imports: string[];
    // properties: ModelProperty[];
}
