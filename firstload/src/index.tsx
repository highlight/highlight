type HighlightPublicInterface = {
    init: (orgID: number, debug?: boolean) => void;
    identify: (identify: string, obj: any) => void;
    getSessionURL: () => Promise<string>;
    onHighlightReady: (func: () => void) => void;
};

interface HighlightWindow extends Window {
    Highlight: any;
    H: HighlightPublicInterface;
    _h_script: string;
}

const HIGHLIGHT_URL = 'app.highlight.run';

declare var window: HighlightWindow;

var script: HTMLScriptElement;
var highlight_obj: any;
var script = document.createElement('script');
export const H: HighlightPublicInterface = {
    init: (orgID: number, debug: boolean = false) => {
        script.addEventListener('load', () => {
            highlight_obj = new window.Highlight(debug);
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

window.H = H;

// in webpack.config.js, the default value for this variable is set
// if overwritten (in dev for example), it'll be seen here.
var scriptSrc =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/index.js'
        : 'https://static.highlight.run/index.js';
script.setAttribute('src', scriptSrc + '?' + new Date().getMilliseconds());
script.setAttribute('type', 'text/javascript');
document.getElementsByTagName('head')[0].appendChild(script);
