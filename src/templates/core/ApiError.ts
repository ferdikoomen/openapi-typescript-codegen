/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { isSuccess } from './isSuccess';
import { Result } from './Result';

export class ApiError extends Error {

    public readonly url: string;
    public readonly status: number;
    public readonly statusText: string;
    public readonly body: any;

    constructor(result: Readonly<Result>, message: string) {
        super(message);

        this.url = result.url;
        this.status = result.status;
        this.statusText = result.statusText;
        this.body = result.body;
    }
}

/**
 * Catch common errors (based on status code).
 * @param result
 */
export function catchGenericError(result: Result): void {
    switch (result.status) {
        case 400: throw new ApiError(result, 'Bad Request');
        case 401: throw new ApiError(result, 'Unauthorized');
        case 403: throw new ApiError(result, 'Forbidden');
        case 404: throw new ApiError(result, 'Not Found');
        case 500: throw new ApiError(result, 'Internal Server Error');
        case 502: throw new ApiError(result, 'Bad Gateway');
        case 503: throw new ApiError(result, 'Service Unavailable');
    }

    if (!isSuccess(result.status)) {
        throw new ApiError(result, 'Generic Error');
    }
}
