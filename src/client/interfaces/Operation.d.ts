import { OperationError } from './OperationError';
import { OperationParameters } from './OperationParameters';

export interface Operation extends OperationParameters {
    service: string;
    name: string;
    summary?: string;
    description?: string;
    deprecated: boolean;
    method: string;
    path: string;
    errors: OperationError[];
    result: string;
}
