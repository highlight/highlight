import { NetworkResourceContent } from '../../../frontend/src/util/shared-types';

export type FetchNetworkContent = {
    startTime: number;
    url?: string;
    request?: any;
    response?: Response;
    errorContent?: any;
};

export const fetchToNetworkResource = (f: FetchNetworkContent) => {
    const resp = f.response;
    if (resp) {
        console.log(f.response?.status);
        console.log(f.response?.redirected);
        console.log(f.response?.headers.forEach((a, b) => console.log(a, b)));
        console.log(f.response?.statusText);
        console.log(f.response?.type);
        console.log(f.response?.ok);
    }
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
                .finally(() => callback(res));
        });
    };
};
