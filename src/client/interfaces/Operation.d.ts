import { OperationError } from './OperationError';
import { OperationParameters } from './OperationParameters';
import { OperationResponse } from './OperationResponse';

export interface Operation extends OperationParameters {
    service: string;
    name: string;
    summary: string | null;
    description: string | null;
    deprecated: boolean;
    method: string;
    path: string;
    errors: OperationError[];
    results: OperationResponse[];
    responseHeader: string | null;
}
