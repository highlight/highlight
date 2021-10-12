import { SessionData } from '../../../index';
import { NetworkListenerCallback } from '../network-listener';
import { Headers, Request, RequestResponsePair, Response } from './models';
import { createNetworkRequestId, shouldNetworkRequestBeRecorded, shouldNetworkRequestBeTraced } from './utils';

interface BrowserXHR extends XMLHttpRequest {
    _method: string;
    _url: string;
    _requestHeaders: Headers;
    _responseSize?: number;
    _shouldRecordHeaderAndBody: boolean;
}

/**
 * Listens to all XMLHttpRequests made.
 */
export const XHRListener = (
    callback: NetworkListenerCallback,
    backendUrl: string,
    tracingOrigins: string[],
    urlBlocklist: string[],
    sessionData: SessionData,
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
        this._shouldRecordHeaderAndBody = !urlBlocklist.some((blockedUrl) =>
            url.toLowerCase().includes(blockedUrl)
        );

        // @ts-expect-error
        return originalOpen.apply(this, arguments);
    };

    XHR.setRequestHeader = function (
        this: BrowserXHR,
        header: string,
        value: string
    ) {
        this._requestHeaders[header] = value;
        console.log('xhr: setting header for: ', this._url, header, value);

        // @ts-expect-error
        return originalSetRequestHeader.apply(this, arguments);
    };

    XHR.send = function (this: BrowserXHR, postData: any) {
        if (
            !shouldNetworkRequestBeRecorded(this._url, backendUrl, tracingOrigins)
        ) {
            // @ts-expect-error
            return originalSend.apply(this, arguments);
        }

        const requestId = createNetworkRequestId();
        if (shouldNetworkRequestBeTraced(this._url, tracingOrigins)) {
            this.setRequestHeader('X-Highlight-Request', sessionData.sessionID.toString() + "/" + requestId);
        }

        const shouldRecordHeaderAndBody = this._shouldRecordHeaderAndBody;
        const requestModel: Request = {
            id: requestId,
            url: this._url,
            verb: this._method,
            headers: shouldRecordHeaderAndBody ? this._requestHeaders : {},
            body: undefined,
        };

        // The load event for XMLHttpRequest is fired when a request completes successfully.
        this.addEventListener('load', async function () {
            const responseModel: Response = {
                status: this.status,
                headers: {},
                body: undefined,
            };

            if (shouldRecordHeaderAndBody) {
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
                responseModel.headers = headerMap;

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
            }

            const event: RequestResponsePair = {
                request: requestModel,
                response: responseModel,
                urlBlocked: !shouldRecordHeaderAndBody,
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

            const event: RequestResponsePair = {
                request: requestModel,
                response: responseModel,
                urlBlocked: false,
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

function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}