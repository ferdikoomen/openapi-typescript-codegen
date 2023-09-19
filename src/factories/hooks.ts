import { SWRResponse } from 'swr';

import { SchemaConfig, RequestInput, SchemaOptions, RequestOutput } from './commons';

export type HookResult<Data extends RequestOutput = RequestOutput> = SWRResponse<Data>;

export interface HookFactory {
    <Input extends RequestInput, Output extends RequestOutput = RequestOutput>(config: SchemaConfig): (
        input: Input,
        options?: SchemaOptions
    ) => HookResult<Output>;
}
