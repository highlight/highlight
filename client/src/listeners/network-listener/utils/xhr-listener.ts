import { Headers, Request, Response } from './models';

interface BrowserXHR extends XMLHttpRequest {
    _method: string;
    _url: string;
    _requestHeaders: Headers;
}

/**
 * Listens to all XMLHttpRequests made.
 */
export const XHRListener = () => {
    const XHR = XMLHttpRequest.prototype;

    const originalOpen = XHR.open;
    const originalSend = XHR.send;
    const originalSetRequestHeader = XHR.setRequestHeader;

    /**
     * When a request gets initiated, store metadata for that specific request.
     */
    XHR.open = function (this: BrowserXHR, method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};

        // @ts-expect-error
        return originalOpen.apply(this, arguments);
    };

    XHR.setRequestHeader = function (this: BrowserXHR, header, value) {
        this._requestHeaders[header] = value;

        // @ts-expect-error
        return originalSetRequestHeader.apply(this, arguments);
    };

    XHR.send = function (this: BrowserXHR, postData) {
        const requestModel: Request = {
            url: this._url,
            verb: this._method,
            headers: this._requestHeaders,
            body: undefined,
        };
        // The load event for XMLHttpRequest is fired when a request completes successfully.
        this.addEventListener('load', async function () {
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
            const responseModel: Response = {
                status: this.status,
                headers: responseHeaders,
                body: undefined,
            };

            if (
                (this.responseType === '' ||
                    this.responseType === 'text' ||
                    this.responseType === 'json') &&
                this.responseText
            ) {
                responseModel['body'] = this.responseText;
            } else if (this.responseType === 'blob') {
                const response = await (this.response as Blob).text();
                responseModel['body'] = response;
            }

            const event = {
                request: requestModel,
                response: responseModel,
            };

            console.log(event);
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

            console.log('error', event);
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
