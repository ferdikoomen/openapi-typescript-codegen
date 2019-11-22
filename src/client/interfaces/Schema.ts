import { Model } from './Model';

export interface Schema {
    export: 'reference' | 'generic' | 'enum' | 'array' | 'dictionary' | 'interface';
    type: string;
    base: string;
    template: string | null;
    link: Model | null;
    description: string | null;
    imports: string[];
}
