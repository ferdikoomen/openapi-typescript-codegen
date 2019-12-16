/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Definition } from '../core/Definition';

export interface Dictionary<T> {

    /**
     * @internal
     */
    readonly __type: T,

    [key: string]: T;
}

export namespace Dictionary {

    export const definition: Definition<Dictionary<any>> = {
        type: 'Dictionary',
        item: {
            type: 'any'
        }
    };

}
