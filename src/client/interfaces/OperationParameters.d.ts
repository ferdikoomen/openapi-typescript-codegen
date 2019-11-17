import { OperationParameter } from './OperationParameter';

export interface OperationParameters {
    imports: string[];
    parameters: OperationParameter[];
    parametersPath: OperationParameter[];
    parametersQuery: OperationParameter[];
    parametersForm: OperationParameter[];
    parametersHeader: OperationParameter[];
    parametersBody?: OperationParameter;
}
