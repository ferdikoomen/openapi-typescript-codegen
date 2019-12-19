/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

/**
 * Check success response code.
 * @param status Status code
 */
export function isSuccess(status: number): boolean {
    return status >= 200 && status < 300;
}
