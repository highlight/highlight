// javascript-obfuscator:enable
type HighlightPublicInterface = {
    init: (orgID: number, debug?: boolean) => void;
    identify: (identify: string, obj: any) => void;
    onHighlightReady: (func: () => void) => void;
};

interface HighlightWindow extends Window {
    Highlight: any;
    H: HighlightPublicInterface;
    _h_script: string;
}

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
    onHighlightReady: (func: () => void) => {
        var interval = setInterval(function () {
            if (highlight_obj && highlight_obj.ready) {
                clearInterval(interval);
                func();
            }
        }, 200);
    },
};
window.H = H;

var scriptSrc: string;
if (window._h_script) {
    scriptSrc = window._h_script;
} else if (process.env.REACT_APP_H_SCRIPT) {
    scriptSrc = process.env.REACT_APP_H_SCRIPT;
} else {
    scriptSrc = 'https://static.highlight.run/index.js';
}
script.setAttribute('src', scriptSrc + '?' + new Date().getMilliseconds());
script.setAttribute('type', 'text/javascript');
document.getElementsByTagName('head')[0].appendChild(script);
