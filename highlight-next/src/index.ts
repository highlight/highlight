import { Highlight, NodeOptions } from '@highlight-run/node';

export interface HighlightInterface {
    init: (options: NodeOptions) => void;
    consumeError: (
        error: Error,
        secureSessionId: string,
        requestId: string
    ) => void;
}

var highlight_obj: Highlight;
export const H: HighlightInterface = {
    init: (options: NodeOptions) => {
        try {
            highlight_obj = new Highlight(options);
        } catch (e) {
            console.log('highlight-next init error: ', e);
        }
    },
    consumeError: (
        error: Error,
        secureSessionId: string,
        requestId: string
    ) => {
        try {
            highlight_obj.consumeCustomError(error, secureSessionId, requestId);
        } catch (e) {
            console.log('highlight-next error: ', e);
        }
    },
};

export { Highlight } from './util/withHighlight';
