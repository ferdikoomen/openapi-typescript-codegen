import { HttpClient } from '../HttpClient';
import { getHttpRequestName } from './getHttpRequestName';

describe('getHttpClientName', () => {
    it('should convert the FETCH client', () => {
        expect(getHttpRequestName(HttpClient.FETCH)).toEqual('FetchHttpRequest');
    });
    it('should convert the NODE client', () => {
        expect(getHttpRequestName(HttpClient.NODE)).toEqual('NodeHttpRequest');
    });
    it('should convert the XHR client', () => {
        expect(getHttpRequestName(HttpClient.XHR)).toEqual('XhrHttpRequest');
    });
});
