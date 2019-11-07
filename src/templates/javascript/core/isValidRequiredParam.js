/* istanbul ignore file */
/* eslint-disable */

/**
 * Check if a parameter is valid.
 * @param param The parameter value.
 * @param name The parameter name.
 */
export function isValidRequiredParam(param, name) {
    if (param === undefined || param === null) {
        throw new Error(`Required parameter '${name}' was undefined or null.`);
    }
}
