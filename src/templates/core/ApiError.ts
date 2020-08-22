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

export namespace ApiError {
    export enum Message {
        BAD_REQUEST = 'Bad Request',
        UNAUTHORIZED = 'Unauthorized',
        FORBIDDEN = 'Forbidden',
        NOT_FOUND = 'Not Found',
        INTERNAL_SERVER_ERROR = 'Internal Server Error',
        BAD_GATEWAY = 'Bad Gateway',
        SERVICE_UNAVAILABLE = 'Service Unavailable',
        GENERIC_ERROR = 'Generic Error',
    }
}

/**
 * Catch common errors (based on status code).
 * @param result
 */
export function catchGenericError(result: Result): void {
    switch (result.status) {
        case 400: throw new ApiError(result, ApiError.Message.BAD_REQUEST);
        case 401: throw new ApiError(result, ApiError.Message.UNAUTHORIZED);
        case 403: throw new ApiError(result, ApiError.Message.FORBIDDEN);
        case 404: throw new ApiError(result, ApiError.Message.NOT_FOUND);
        case 500: throw new ApiError(result, ApiError.Message.INTERNAL_SERVER_ERROR);
        case 502: throw new ApiError(result, ApiError.Message.BAD_GATEWAY);
        case 503: throw new ApiError(result, ApiError.Message.SERVICE_UNAVAILABLE);
    }

    if (!isSuccess(result.status)) {
        throw new ApiError(result, ApiError.Message.GENERIC_ERROR);
    }
}
