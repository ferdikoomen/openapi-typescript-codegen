/* istanbul ignore file */
/* eslint-disable */

/**
 * Check success response code.
 * @param status Status code
 */
export function isSuccess(status) {
    return (status >= 200 && status < 300);
}
