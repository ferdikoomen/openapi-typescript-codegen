import { SWRResponse } from 'swr';

import { EndpointConfig, RequestInput, SchemaOptions } from './commons';

export type HookResult<Data> = SWRResponse<Data>;

export interface HookFactory {
    <Input extends RequestInput, Output>(config: EndpointConfig): (
        input: Input,
        options?: SchemaOptions
    ) => HookResult<Output>;
}
