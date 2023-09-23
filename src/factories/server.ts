import { EndpointConfig, RequestInput, SchemaOptions } from './commons';

export interface ServerResolverFactory {
    <Input extends RequestInput, Output>(config: EndpointConfig): (
        input: Input,
        options?: SchemaOptions
    ) => Promise<Output>;
}
