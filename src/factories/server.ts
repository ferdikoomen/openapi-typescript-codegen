import { EndpointConfig, RequestInput, SchemaOptions, RequestOutput } from './commons';

export interface ServerResolverFactory {
    <Input extends RequestInput, Output extends RequestOutput>(config: EndpointConfig): (
        input: Input,
        options?: SchemaOptions
    ) => Promise<Output>;
}
