export function getHttpRequestName(httpClientName: string): string {
    return httpClientName[0].toUpperCase() + httpClientName.substring(1) + 'HttpRequest';
}
