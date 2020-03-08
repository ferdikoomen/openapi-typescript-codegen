/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { isSuccess } from './isSuccess';
import { Result } from './Result';

/**
 * Try to parse the content for any response status code.
 * We check the "Content-Type" header to see if we need to parse the
 * content as json or as plain text.
 * @param xhr XHR request object
 */
function parseBody(xhr: XMLHttpRequest): any {
    try {
        const contentType = xhr.getResponseHeader('Content-Type');
        if (contentType) {
            switch (contentType.toLowerCase()) {
                case 'application/json':
                case 'application/json; charset=utf-8':
                    return JSON.parse(xhr.responseText);

                default:
                    return xhr.responseText;
            }
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}

/**
 * Request content using the new legacy XMLHttpRequest API. This method is useful
 * when we want to request UTF-16 content, since it natively supports loading UTF-16.
 * We could do the same with the Fetch API, but then we will need to convert the
 * content using JavaScript... And that is very very slow.
 * @param url The url to request.
 * @param request The request object, containing method, headers, body, etc.
 */
export async function requestUsingXHR(url: string, request: Readonly<RequestInit>): Promise<Result> {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();

        // Open the request, remember to do this before adding any headers,
        // because the request needs to be initialized!
        xhr.open(request.method!, url, true);

        // Add the headers (required when dealing with JSON)
        const headers = request.headers as Headers;
        headers.forEach((value: string, key: string): void => {
            xhr.setRequestHeader(key, value);
        });

        // Register the readystate handler, this will fire when the request is done.
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {

                // Create result object.
                const result: Result = {
                    url,
                    ok: isSuccess(xhr.status),
                    status: xhr.status,
                    statusText: xhr.statusText,
                    body: parseBody(xhr),
                };


                // Done!
                resolve(result);
            }
        };

        // Start the request!
        xhr.send(request.body);
    });
}
