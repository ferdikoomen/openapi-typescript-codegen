import { Model } from './Model';

export interface OperationParameter extends Model {
    prop: string;
    in: 'path' | 'query' | 'header' | 'formData' | 'body';
    default: any;
}
