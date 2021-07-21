import { NetworkListenerCallback } from '../network-listener';
import { Headers, Request, Response } from './models';
import { isHighlightNetworkResourceFilter } from './utils';

interface BrowserXHR extends XMLHttpRequest {
    _method: string;
    _url: string;
    _requestHeaders: Headers;
    _responseSize?: number;
}

/**
 * Listens to all XMLHttpRequests made.
 */
export const XHRListener = (
    callback: NetworkListenerCallback,
    backendUrl: string
) => {
    const XHR = XMLHttpRequest.prototype;

    const originalOpen = XHR.open;
    const originalSend = XHR.send;
    const originalSetRequestHeader = XHR.setRequestHeader;

    /**
     * When a request gets initiated, store metadata for that specific request.
     */
    XHR.open = function (this: BrowserXHR, method: string, url: string) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};

        // @ts-expect-error
        return originalOpen.apply(this, arguments);
    };

    XHR.setRequestHeader = function (
        this: BrowserXHR,
        header: string,
        value: string
    ) {
        this._requestHeaders[header] = value;

        // @ts-expect-error
        return originalSetRequestHeader.apply(this, arguments);
    };

    XHR.send = function (this: BrowserXHR, postData: any) {
        const requestModel: Request = {
            url: this._url,
            verb: this._method,
            headers: this._requestHeaders,
            body: undefined,
        };
        // The load event for XMLHttpRequest is fired when a request completes successfully.
        this.addEventListener('load', async function () {
            if (
                isHighlightNetworkResourceFilter(requestModel.url, backendUrl)
            ) {
                return;
            }
            if (postData) {
                if (typeof postData === 'string') {
                    requestModel['body'] = postData;
                } else if (
                    typeof postData === 'object' ||
                    typeof postData === 'number' ||
                    typeof postData === 'boolean'
                ) {
                    requestModel['body'] = postData.toString();
                }
            }

            const responseHeaders = this.getAllResponseHeaders();
            // Convert the header string into an array
            // of individual headers
            const normalizedResponseHeaders = responseHeaders
                .trim()
                .split(/[\r\n]+/);

            // Create a map of header names to values
            const headerMap: { [key: string]: any } = {};
            normalizedResponseHeaders.forEach(function (line) {
                const parts = line.split(': ');
                const header = parts.shift() as string;
                const value = parts.join(': ');
                headerMap[header] = value;
            });

            const responseModel: Response = {
                status: this.status,
                headers: headerMap,
                body: undefined,
            };

            if (
                (this.responseType === '' ||
                    this.responseType === 'text' ||
                    this.responseType === 'json') &&
                this.responseText
            ) {
                responseModel['body'] = this.responseText;
                // Each character is 8 bytes, total size is number of characters multiplied by 8.
                responseModel['size'] = this.responseText.length * 8;
            } else if (this.responseType === 'blob') {
                const blob = this.response as Blob;
                const response = await blob.text();
                responseModel['body'] = response;
                responseModel['size'] = blob.size;
            }

            const event = {
                request: requestModel,
                response: responseModel,
            };

            callback(event);
        });

        /**
         * The error event happens when a network request fails. A 4xx or 5xx
         * response will not trigger this, those will still trigger a load event.
         * An error is if the request is blocked, some scenarios:
         * 1. The request is blocked by an extension
         * 2. The request is blocked by the DevTools
         * 3. The client is offline
         */
        this.addEventListener('error', async function () {
            const responseModel: Response = {
                status: this.status,
                headers: undefined,
                body: undefined,
            };

            const event = {
                request: requestModel,
                response: responseModel,
            };

            callback(event);
        });

        // @ts-expect-error
        return originalSend.apply(this, arguments);
    };

    return () => {
        XHR.open = originalOpen;
        XHR.send = originalSend;
        XHR.setRequestHeader = originalSetRequestHeader;
    };
};
