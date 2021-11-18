import { HighlightFetchWindow } from '../listeners/network-listener/utils/fetch-listener';

declare var window: HighlightFetchWindow & Window;

export const SegmentIntegrationListener = (callback: (obj: any) => void) => {
    callback(window.location.href);
    var send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (data: any) {
        setTimeout(() => {
            var obj: any;
            try {
                obj = JSON.parse(data?.toString() ?? '');
            } catch (e) {
                return;
            }
            if (obj.type === 'track' || obj.type === 'identify') {
                callback(obj);
            }
        }, 100);
        send.call(this, data);
    };

    const fetchProxy = window._fetchProxy;
    window._fetchProxy = (input, init) => {
        const url =
            (typeof input === 'object' && input.url) || (input as string);
        const isSegmentRequest = url.includes('api.segment.io');

        if (isSegmentRequest && init && 'body' in init) {
            try {
                const body = init.body?.toString();
                if (body) {
                    const object = JSON.parse(body);
                    if (object.type === 'track' || object.type === 'identify') {
                        callback(object);
                    }
                }
            } catch (e) {
                return fetchProxy.call(this, input, init);
            }
        }
        return fetchProxy.call(this, input, init);
    };

    return () => {
        XMLHttpRequest.prototype.send = send;
        window.fetch = fetchProxy;
    };
};
