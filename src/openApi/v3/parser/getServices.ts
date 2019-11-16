import { Service } from '../../../client/interfaces/Service';
import { OpenApi } from '../interfaces/OpenApi';

/**
 * Parse and return the OpenAPI services.
 * @param openApi
 */
export function getServices(openApi: OpenApi): Map<string, Service> {
    const services = new Map<string, Service>();
    return services;
}
