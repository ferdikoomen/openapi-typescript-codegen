import { Model } from './Model';
import { Service } from './Service';

export interface Client {
    version: string;
    server: string;
    models: Map<string, Model>;
    services: Map<string, Service>;
}
