/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */

import { getFormData } from './getFormData';
import { getQueryString } from './getQueryString';
import { OpenAPI } from './OpenAPI';
import { RequestOptions } from './RequestOptions';
import { requestUsingFetch } from './requestUsingFetch';
import { requestUsingXHR } from './requestUsingXHR';
import { Result } from './Result';

/**
 * Create the request.
 * @param options Request method options.
 * @returns Result object (see above)
 */
export async function request(options: Readonly<RequestOptions>): Promise<Result> {

    // Create the request URL
    let url = `${OpenAPI.BASE}${options.path}`;

    // Create request headers
    const headers = new Headers({
        ...options.headers,
        Accept: 'application/json',
    });

    // Create request settings
    const request: RequestInit = {
        headers,
        method: options.method,
        credentials: 'same-origin',
    };

    // If we have a bearer token then we set the authentication header.
    if (OpenAPI.TOKEN !== null && OpenAPI.TOKEN !== '') {
        headers.append('Authorization', `Bearer ${OpenAPI.TOKEN}`);
    }

    // Add the query parameters (if defined).
    if (options.query) {
        url += getQueryString(options.query);
    }

    // Append formData as body
    if (options.formData) {
        request.body = getFormData(options.formData);
    } else if (options.body) {

        // If this is blob data, then pass it directly to the body and set content type.
        // Otherwise we just convert request data to JSON string (needed for fetch api)
        if (options.body instanceof Blob) {
            request.body = options.body;
            if (options.body.type) {
                headers.append('Content-Type', options.body.type);
            }
        } else {
            request.body = JSON.stringify(options.body);
            headers.append('Content-Type', 'application/json');
        }
    }

    try {
        switch (OpenAPI.CLIENT) {
            case 'xhr':
                return await requestUsingXHR(url, request);
            default:
                return await requestUsingFetch(url, request);
        }
    } catch (error) {
        return {
            url,
            ok: false,
            status: 0,
            statusText: '',
            body: error,
        };
    }
}
