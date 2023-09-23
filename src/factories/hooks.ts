/* eslint-disable @typescript-eslint/no-explicit-any */
import { SWRConfiguration, SWRResponse } from 'swr';

import { EndpointConfig, RequestInput, SchemaOptions } from './commons';

export type SWRHookResult<Data, E = Error, SWRConfig extends SWRConfiguration = SWRConfiguration> = SWRResponse<
    Data,
    E,
    SWRConfig
>;

export interface SWRHookFactory {
    <Input extends RequestInput, Output, E = Error, SWRConfig extends SWRConfiguration = SWRConfiguration<Output, E>>(
        config: EndpointConfig
    ): (input: Input, swrOptions?: SWRConfig, fetchOptions?: SchemaOptions) => SWRHookResult<Output, E, SWRConfig>;
}
