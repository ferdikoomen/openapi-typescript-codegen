import { Model } from './Model';

export interface OperationParameter extends Model {
    in: 'path' | 'query' | 'header' | 'formData' | 'body' | 'cookie';
    prop: string;
}
