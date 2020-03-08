/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Result } from './Result';

/**
 * Try to parse the content for any response status code.
 * We check the "Content-Type" header to see if we need to parse the
 * content as json or as plain text.
 * @param response Response object from fetch
 */
async function parseBody(response: Response): Promise<any> {
    try {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            switch (contentType.toLowerCase()) {
                case 'application/json':
                case 'application/json; charset=utf-8':
                    return await response.json();

                default:
                    return await response.text();
            }
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}

/**
 * Request content using the new Fetch API. This is the default API that is used and
 * is create for all JSON, XML and text objects. However it is limited to UTF-8.
 * This is a problem for some of the Docs content, since that requires UTF-16!
 * @param url The url to request.
 * @param request The request object, containing method, headers, body, etc.
 */
export async function requestUsingFetch(url: string, request: Readonly<RequestInit>): Promise<Result> {

    // Fetch response using fetch API.
    const response = await fetch(url, request);

    // Create result object.
    return {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: await parseBody(response),
    };
}
