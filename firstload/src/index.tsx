// javascript-obfuscator:enable
interface Window {
  highlight_obj: any;
  H: any;
  Highlight: any;
}
window.H = {};
window.H.init = (
  orgID: number,
  scriptPath: string = 'https://static.highlight.run/index.js'
) => {
  var script = document.createElement('script');
  script.setAttribute('src', scriptPath + '?' + new Date().getMilliseconds());
  script.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(script);
  script.addEventListener('load', () => {
    window.highlight_obj = new window.Highlight(window['_h_debug']);
    window.highlight_obj.initialize(orgID);
  });
};
window.H.identify = (identifier: string, obj: any) => {
  var interval = setInterval(function () {
    if (window.highlight_obj && window.highlight_obj.ready) {
      clearInterval(interval);
      window.highlight_obj.identify(identifier, obj);
    }
  }, 200);
};
