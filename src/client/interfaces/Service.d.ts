import { ServiceOperation } from './ServiceOperation';

export interface Service {
    name: string;
    operations: ServiceOperation[];
    imports: string[];
}
