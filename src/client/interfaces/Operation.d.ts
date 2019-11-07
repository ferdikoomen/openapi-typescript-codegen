import { OperationError } from './OperationError';
import { Parameter } from './Parameter';

export interface Operation {
    service: string;
    name: string;
    summary?: string;
    description?: string;
    deprecated?: boolean;
    method: string;
    path: string;
    parameters: Parameter[];
    parametersPath: Parameter[];
    parametersQuery: Parameter[];
    parametersForm: Parameter[];
    parametersHeader: Parameter[];
    parametersBody: Parameter | null;
    errors: OperationError[];
    result: string;
    imports: string[];
}
