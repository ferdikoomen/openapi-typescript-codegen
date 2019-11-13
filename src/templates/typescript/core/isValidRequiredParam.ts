/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

/**
 * Check if a parameter is valid.
 * @param param The parameter value.
 * @param name The parameter name.
 */
export function isValidRequiredParam(param: any, name: string): void {
    if (param === undefined || param === null) {
        throw new Error(`Required parameter '${name}' was undefined or null.`);
    }
}
