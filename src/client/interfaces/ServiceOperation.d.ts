import { ServiceOperationError } from './ServiceOperationError';
import { ServiceOperationParameter } from './ServiceOperationParameter';
import { Model } from './Model';
import { ServiceOperationResponse } from './ServiceOperationResponse';

export interface ServiceOperation {
    name: string;
    summary?: string;
    description?: string;
    deprecated?: boolean;
    method: string;
    path: string;
    parameters: ServiceOperationParameter[];
    parametersPath: ServiceOperationParameter[];
    parametersQuery: ServiceOperationParameter[];
    parametersForm: ServiceOperationParameter[];
    parametersHeader: ServiceOperationParameter[];
    parametersBody: ServiceOperationParameter | null;
    models: Model[];
    errors: ServiceOperationError[];
    response: ServiceOperationResponse | null;
    result: string;
}
