/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

/**
 * Get FormData from object. This method is needed to upload
 * multipart form data to the REST API.
 * @param params Key value based object.
 */
export function getFormData(params: { [key: string]: any }): FormData {
    const formData: FormData = new FormData();
    for (const key in params) {
        if (typeof params[key] !== 'undefined') {
            const value: any = params[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        }
    }
    return formData;
}
