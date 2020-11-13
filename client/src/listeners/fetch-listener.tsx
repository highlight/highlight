import { NetworkResourceContent } from '../../../frontend/src/util/shared-types';

export const FetchListener = (
    callback: (r: NetworkResourceContent) => void
) => {
    var res: NetworkResourceContent = { startTime: Date.now() };
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
