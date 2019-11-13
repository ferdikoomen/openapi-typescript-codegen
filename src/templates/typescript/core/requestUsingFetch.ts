/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Result } from './Result';

/**
 * Request content using the new Fetch API. This is the default API that is used and
 * is create for all JSON, XML and text objects. However it is limited to UTF-8.
 * This is a problem for some of the Docs content, since that requires UTF-16!
 * @param url The url to request.
 * @param request The request object, containing method, headers, body, etc.
 */
export async function requestUsingFetch<T = any>(url: string, request: Readonly<RequestInit>): Promise<Result<T>> {
    // Fetch response using fetch API.
    const response: Response = await fetch(url, request);

    // Create result object.
    const result: Result = {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: null,
    };

    // Try to parse the content for any response status code.
    // We check the "Content-Type" header to see if we need to parse the
    // content as json or as plain text.
    const contentType: string | null = response.headers.get('Content-Type');
    if (contentType) {
        switch (contentType.toLowerCase()) {
            case 'application/json':
            case 'application/json; charset=utf-8':
                result.body = await response.json();
                break;

            case 'text/plain':
            case 'text/xml':
            case 'text/xml; charset=utf-8':
            case 'text/xml; charset=utf-16':
                result.body = await response.text();
                break;
        }
    }

    return result;
}
