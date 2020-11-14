import { Highlight } from '../../client/src/index';

export type HighlightOptions = {
    debug?: boolean;
    scriptUrl?: string;
    backendUrl?: string;
};

type HighlightPublicInterface = {
    init: (orgID: number, debug?: HighlightOptions) => void;
    identify: (identify: string, obj: any) => void;
    getSessionURL: () => Promise<string>;
    onHighlightReady: (func: () => void) => void;
};

// TODO: this type shouldn't be manually here, it should be inferred directly from /client/src/...
interface Constructable<T> {
    new (debug?: boolean, backendUrl?: string): T;
}

interface HighlightWindow extends Window {
    Highlight: Constructable<Highlight>;
    H: HighlightPublicInterface;
    _h_script: string;
}

const HIGHLIGHT_URL = 'app.highlight.run';

declare var window: HighlightWindow;

var script: HTMLScriptElement;
var highlight_obj: any;
export const H: HighlightPublicInterface = {
    init: (orgID: number, options?: HighlightOptions) => {
        script = document.createElement('script');
        var scriptSrc = options?.scriptUrl
            ? options.scriptUrl
            : 'https://static.highlight.run/index.js';
        script.setAttribute(
            'src',
            scriptSrc + '?' + new Date().getMilliseconds()
        );
        script.setAttribute('type', 'text/javascript');
        document.getElementsByTagName('head')[0].appendChild(script);
        script.addEventListener('load', () => {
            highlight_obj = new window.Highlight(
                options?.debug,
                options?.backendUrl
            );
            highlight_obj.initialize(orgID);
        });
    },
    identify: (identifier: string, obj: any) => {
        H.onHighlightReady(() => highlight_obj.identify(identifier, obj));
    },
    getSessionURL: () => {
        return new Promise<string>((resolve, reject) => {
            H.onHighlightReady(() => {
                const orgID = highlight_obj.organizationID;
                const sessionID = highlight_obj.sessionID;
                if (orgID && sessionID) {
                    const res = `${HIGHLIGHT_URL}/${orgID}/sessions/${sessionID}`;
                    resolve(res);
                } else {
                    reject(new Error('org ID or session ID is empty'));
                }
            });
        });
    },
    onHighlightReady: (func: () => void) => {
        if (highlight_obj && highlight_obj.ready) {
            func();
        }
        var interval = setInterval(function () {
            if (highlight_obj && highlight_obj.ready) {
                clearInterval(interval);
                func();
            }
        }, 200);
    },
};

if (typeof window !== 'undefined') {
    window.H = H;
}
