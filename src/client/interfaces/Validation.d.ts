export interface Validation {
    type: 'ref' | 'type' | 'enum' | 'array' | 'dictionary' | 'property' | 'model';
    childType?: string | null;
    childBase?: string | null;
    childValidation?: Validation;
}
