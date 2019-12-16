/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Schema } from '../core/Schema';

export interface Dictionary<T> {

    /**
     * @internal
     */
    readonly __type: T,

    [key: string]: T;
}

export namespace Dictionary {

    export const schema: Schema<Dictionary<any>> = {
        type: 'Dictionary',
        item: {
            type: 'any'
        }
    };

}
