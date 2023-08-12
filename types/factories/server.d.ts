import { SchemaConfig, RequestInput, SchemaOptions, RequestOutput } from './commons';

export interface ServerResolverFactory {
    <Input extends RequestInput, Output extends RequestOutput>(config: SchemaConfig): (
        input: Input,
        options?: SchemaOptions
    ) => Promise<Output>;
}
