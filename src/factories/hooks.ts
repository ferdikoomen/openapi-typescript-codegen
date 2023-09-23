import { SWRResponse } from 'swr';

import { EndpointConfig, RequestInput, SchemaOptions, RequestOutput } from './commons';

export type HookResult<Data extends RequestOutput = RequestOutput> = SWRResponse<Data>;

export interface HookFactory {
    <Input extends RequestInput, Output extends RequestOutput = RequestOutput>(config: EndpointConfig): (
        input: Input,
        options?: SchemaOptions
    ) => HookResult<Output>;
}
