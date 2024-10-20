import type { Model } from './Model';

export interface OperationParameter extends Model {
    in: 'path' | 'query' | 'header' | 'formData' | 'body' | 'cookie';
    prop: string;
    mediaType: string | null;
    style: 'simple' | 'label' | 'matrix' | 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject' | null;
    explode: boolean | null;
}
