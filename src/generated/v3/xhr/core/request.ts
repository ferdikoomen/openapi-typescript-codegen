import { ApiError } from './ApiError';
import { ApiRequestOptions } from './ApiRequestOptions';
import { ApiResult } from './ApiResult';
import { OpenAPI } from './OpenAPI';

function isDefined<T>(value: T | null | undefined): value is Exclude<T, null | undefined> {
    return value !== undefined && value !== null;
}
function isSuccess(status: number): boolean {
    return status >= 200 && status < 300;
}
function getQueryString(params: Record<string, any>): string {
    const qs: string[] = [];

    Object.keys(params).forEach(key => {
        const value = params[key];
        if (isDefined(value)) {
            if (Array.isArray(value)) {
                value.forEach(value => {
                    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                });
            } else {
                qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
    });

    if (qs.length > 0) {
        return `?${qs.join('&')}`;
    }

    return '';
}
function getUrl(options: ApiRequestOptions): string {
    const path = options.path.replace(/[:]/g, '_');
    const url = `${OpenAPI.BASE}${path}`;

    if (options.query) {
        return url + getQueryString(options.query);
    }

    return url;
}
function getFormData(params: Record<string, any>): FormData {
    const formData = new FormData();

    Object.keys(params).forEach(key => {
        const value = params[key];
        if (isDefined(value)) {
            formData.append(key, value);
        }
    });

    return formData;
}
function getHeaders(options: ApiRequestOptions): Headers {
    const headers = new Headers({
        Accept: 'application/json',
        ...options.headers,
    });

    if (OpenAPI.TOKEN !== null && OpenAPI.TOKEN !== '') {
        headers.append('Authorization', `Bearer ${OpenAPI.TOKEN}`);
    }

    if (options.body) {
        if (options.body instanceof Blob) {
            if (options.body.type) {
                headers.append('Content-Type', options.body.type);
            }
        } else if (typeof options.body === 'string') {
            headers.append('Content-Type', 'text/plain');
        } else {
            headers.append('Content-Type', 'application/json');
        }
    }

    return headers;
}
function getRequestBody(options: ApiRequestOptions): any {
    if (options.formData) {
        return getFormData(options.formData);
    }

    if (options.body) {
        if (options.body instanceof Blob) {
            return options.body;
        } else if (typeof options.body === 'string') {
            return options.body;
        } else {
            return JSON.stringify(options.body);
        }
    }

    return undefined;
}
function sendRequest(options: ApiRequestOptions, url: string): Promise<XMLHttpRequest> {
    return new Promise<XMLHttpRequest>((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open(options.method, url, true);
            xhr.withCredentials = OpenAPI.WITH_CREDENTIALS;

            const headers = getHeaders(options);
            headers.forEach((value, key) => {
                xhr.setRequestHeader(key, value);
            });

            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    resolve(xhr);
                }
            };

            xhr.send(getRequestBody(options));
        } catch (error) {
            reject(error);
        }
    });
}
function getResponseHeader(xhr: XMLHttpRequest, responseHeader?: string): string | null {
    if (responseHeader) {
        const content = xhr.getResponseHeader(responseHeader);
        if (typeof content === 'string') {
            return content;
        }
    }

    return null;
}
function getResponseBody(xhr: XMLHttpRequest): any {
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
function catchErrors(options: ApiRequestOptions, result: ApiResult): void {
    const errors: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        ...options.errors,
    };

    const error = errors[result.status];
    if (error) {
        throw new ApiError(result, error);
    }

    if (!result.ok) {
        throw new ApiError(result, 'Generic Error');
    }
}
/**
 * Request using XHR
 * @param options Request options
 * @result ApiResult
 * @throws ApiError
 */
export async function request(options: ApiRequestOptions): Promise<ApiResult> {
    const url = getUrl(options);
    const response = await sendRequest(options, url);
    const responseBody = getResponseBody(response);
    const responseHeader = getResponseHeader(response, options.responseHeader);

    const result: ApiResult = {
        url,
        ok: isSuccess(response.status),
        status: response.status,
        statusText: response.statusText,
        body: responseHeader || responseBody,
    };

    catchErrors(options, result);
    return result;
}
