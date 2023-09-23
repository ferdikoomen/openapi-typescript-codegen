import { EndpointConfig, RequestInput, SchemaOptions, RequestOutput } from './commons';

export interface ClientResolverFactory {
    <Input extends RequestInput, Output extends RequestOutput>(config: EndpointConfig): (
        input: Input,
        options?: SchemaOptions
    ) => Promise<Output>;
}
