import { Model } from './Model';
import { Service } from './Service';

export interface Client {
    version: string;
    server: string;
    models: Model[];
    services: Service[];
}
