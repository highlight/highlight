// taken from: https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript/52809105#52809105
export const PathListener = (callback: (url: string) => void) => {
  callback(window.location.href);
  history.pushState = ((f) =>
    function pushState() {
      // @ts-ignore
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.pushState);

  history.replaceState = ((f) =>
    function replaceState() {
      // @ts-ignore
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
      return ret;
    })(history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  window.addEventListener('locationchange', function () {
    callback(window.location.href);
  });
};
