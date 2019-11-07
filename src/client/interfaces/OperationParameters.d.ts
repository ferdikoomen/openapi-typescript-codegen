import { Parameter } from './Parameter';

export interface OperationParameters {
    imports: string[];
    parameters: Parameter[];
    parametersPath: Parameter[];
    parametersQuery: Parameter[];
    parametersForm: Parameter[];
    parametersHeader: Parameter[];
    parametersBody: Parameter | null;
}
