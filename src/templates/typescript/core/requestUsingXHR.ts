/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { Result } from './Result';
import { isSuccess } from './isSuccess';

/**
 * Request content using the new legacy XMLHttpRequest API. This method is useful
 * when we want to request UTF-16 content, since it natively supports loading UTF-16.
 * We could do the same with the Fetch API, but then we will need to convert the
 * content using JavaScript... And that is very very slow.
 * @param url The url to request.
 * @param request The request object, containing method, headers, body, etc.
 */
export async function requestUsingXHR<T = any>(url: string, request: Readonly<RequestInit>): Promise<Result<T>> {
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
                    body: null
                };

                // Try to parse the content for any response status code.
                // We check the "Content-Type" header to see if we need to parse the
                // content as json or as plain text.
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType) {
                    switch (contentType.toLowerCase()) {
                        case 'application/json':
                        case 'application/json; charset=utf-8':
                            result.body = JSON.parse(xhr.responseText);
                            break;

                        case 'text/plain':
                        case 'text/xml':
                        case 'text/xml; charset=utf-8':
                        case 'text/xml; charset=utf-16':
                            result.body = xhr.responseText;
                            break;
                    }
                }

                // Done!
                resolve(result);
            }
        };

        // Start the request!
        xhr.send(request.body);
    });
}
