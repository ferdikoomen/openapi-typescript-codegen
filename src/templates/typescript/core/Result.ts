/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export interface Result<T = any> {
    url: string;
    ok: boolean;
    status: number;
    statusText: string;
    body: T;
}
