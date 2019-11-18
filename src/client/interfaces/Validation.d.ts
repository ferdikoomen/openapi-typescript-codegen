export interface Validation {
    type: 'ref' | 'type' | 'enum' | 'array' | 'dictionary' | 'properties';
    childType: string | null;
    childBase: string | null;
    childValidation: Validation | null;
}
