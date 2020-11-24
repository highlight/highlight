import {
    NetworkResourceContent,
    HookRequest,
    HookResponse,
} from '../../../frontend/src/util/shared-types';
// @ts-ignore
import xhook from 'xhook';

export const AjaxListener = (callback: (r: NetworkResourceContent) => void) => {
    xhook.after(function (request: HookRequest, response: HookResponse) {
        console.log('url', request.url);
        var res: NetworkResourceContent = { endTime: Date.now() };
        res.request = request;
        res.response = response;
        callback(res);
    });
};
