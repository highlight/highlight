import { Highlight, HighlightClassOptions } from '../../client/src/index';

export type HighlightOptions = {
    debug?: boolean;
    scriptUrl?: string;
    backendUrl?: string;
    manualStart?: boolean;
};

type HighlightPublicInterface = {
    init: (orgID: number, debug?: HighlightOptions) => void;
    identify: (identify: string, obj: any) => void;
    getSessionURL: () => Promise<string>;
    start: () => void;
    onHighlightReady: (func: () => void) => void;
    options: HighlightOptions | undefined;
};

interface HighlightWindow extends Window {
    Highlight: new (options?: HighlightClassOptions) => Highlight;
    H: HighlightPublicInterface;
    _h_script: string;
}

const HIGHLIGHT_URL = 'app.highlight.run';

declare var window: HighlightWindow;

var script: HTMLScriptElement;
var highlight_obj: Highlight;
export const H: HighlightPublicInterface = {
    options: undefined,
    init: (orgID: number, options?: HighlightOptions) => {
        H.options = options;
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
            highlight_obj = new window.Highlight({
                organizationID: orgID,
                debug: options?.debug,
                backendUrl: options?.backendUrl,
            });
            if (!options?.manualStart) {
                highlight_obj.initialize(orgID);
            }
        });
    },
    start: () => {
        if (H.options?.manualStart) {
            var interval = setInterval(function () {
                if (highlight_obj) {
                    clearInterval(interval);
                    highlight_obj.initialize();
                }
            }, 200);
        } else {
            console.warn(
                "Highlight Error: Can't call `start()` without setting `manualStart` option in `H.init`"
            );
        }
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
