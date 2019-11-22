/* istanbul ignore file */
/* eslint-disable */
/* prettier-ignore */

/**
 * Check success response code.
 * @param status Status code
 */
export function isSuccess(status) {
    return status >= 200 && status < 300;
}
