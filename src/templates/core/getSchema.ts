/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import * as schemas from '../schemas';

/**
 * Get a schema object for a given model name.
 * @param model The model name to return the schema from.
 */
export function getSchema<K extends keyof typeof schemas, T>(model: K) {
    if (schemas.hasOwnProperty(model)) {
        return schemas[model];
    }
    return null;
}
