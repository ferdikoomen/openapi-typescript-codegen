/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Schema } from '../core/Schema';

export interface Dictionary<T> {
    [key: string]: T;
}

export namespace Dictionary {

    export const schema: Schema<Dictionary> = {
        type: 'Dictionary'
    };

}
