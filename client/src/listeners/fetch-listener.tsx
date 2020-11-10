import {
    Header,
    NetworkResourceContent,
} from '../../../frontend/src/util/shared-types';

export type FetchNetworkContent = {
    startTime: number;
    endTime?: number;
    url?: string;
    request?: any;
    response?: Response;
    errorContent?: any;
};

export const fetchToNetworkResource = (
    f: FetchNetworkContent
): NetworkResourceContent => {
    const result: NetworkResourceContent = {
        startTime: f.startTime,
        endTime: f.endTime,
        url: f.url,
        errorContent: f.errorContent,
        request: f.request,
    };
    const resp = f.response;
    if (resp) {
        result.response = {
            status: resp.status,
            redirected: resp.redirected,
            ok: resp.ok,
            type: resp.type,
            statusText: resp.statusText,
        };
        const headers: Array<Header> = [];
        resp.headers.forEach((k, v) => {
            headers.push({ key: k, value: v });
        });
        result.response.headers = headers;
    }
    return result;
};

export const FetchListener = (callback: (r: FetchNetworkContent) => void) => {
    var res: FetchNetworkContent = { startTime: Date.now() };
    const highlightFetch = window.fetch;
    window.fetch = function (url: RequestInfo, body: RequestInit | undefined) {
        res.url = url.toString();
        res.request = body;
        return new Promise(function (this: any, resolve, reject) {
            highlightFetch
                .apply(this, arguments as any)
                .then(async (response) => {
                    res.response = response.clone();
                    resolve(response);
                })
                .catch((error) => {
                    res.errorContent = error;
                    reject(error);
                })
                .finally(() => {
                    res.endTime = Date.now();
                    callback(res);
                });
        });
    };
};
