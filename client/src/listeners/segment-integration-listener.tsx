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

    return () => {
        XMLHttpRequest.prototype.send = send;
    };
};
