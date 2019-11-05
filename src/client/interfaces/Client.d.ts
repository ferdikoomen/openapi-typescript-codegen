import { Model } from './Model';
import { Service } from './Service';
import { Schema } from './Schema';

export interface Client {
    version: string;
    server: string;
    models: Map<string, Model>;
    schemas: Map<string, Schema>;
    services: Map<string, Service>;
}
