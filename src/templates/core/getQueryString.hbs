/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Get query string from query parameters object. This method also
 * supports multi-value items by creating a key for each item.
 * @param params Key value based object.
 */
export function getQueryString(params: { [key: string]: any }): string {
    const qs: string[] = [];
    for (const key in params) {
        if (typeof params[key] !== 'undefined') {
            const value: any = params[key];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(value => {
                        qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                    });
                } else {
                    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                }
            }
        }
    }
    if (qs.length > 0) {
        return `?${qs.join('&')}`;
    }
    return '';
}
