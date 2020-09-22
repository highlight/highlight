// javascript-obfuscator:enable
var script = document.createElement('script');
script.setAttribute(
  'src',
  window['_h_script'] + '?' + new Date().getMilliseconds()
);
script.setAttribute('type', 'text/javascript');
document.getElementsByTagName('head')[0].appendChild(script);
script.addEventListener('load', () => {
  window.highlight_obj = new Highlight(window['_h_debug']);
  highlight_obj.initialize(window['_h_org']);
});
window.H = {};
window.H.identify = (identifier, obj) => {
  var interval = setInterval(function () {
    if (window.highlight_obj && window.highlight_obj.ready) {
      clearInterval(interval);
      window.highlight_obj.identify(identifier, obj);
    }
  }, 200);
};
