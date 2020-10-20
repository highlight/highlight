// taken from: https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript/52809105#52809105
export const initUrlListeners = (callback: (url: string) => void) => {
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

declare global {
  interface Console {
    defaultLog: any;
    defaultError: any;
    defaultWarn: any;
    defaultDebug: any;
  }
}

export type ConsoleMessage = {
  value: string;
  time: number;
  type: ConsoleType;
};

enum ConsoleType {
  Log,
  Debug,
  Error,
  Warn,
}

// taken from: https://stackoverflow.com/questions/19846078/how-to-read-from-chromes-console-in-javascript
export const initConsoleListeners = (callback: (c: ConsoleMessage) => void) => {
  console.defaultLog = console.log.bind(console);
  console.log = function (text: string) {
    callback({
      type: ConsoleType.Log,
      time: Date.now(),
      value: text,
    });
    console.defaultLog.apply(console, arguments);
  };
  console.defaultError = console.error.bind(console);
  console.error = function (text: string) {
    callback({
      type: ConsoleType.Error,
      time: Date.now(),
      value: text,
    });
    console.defaultError.apply(console, arguments);
  };
  console.defaultWarn = console.warn.bind(console);
  console.warn = function (text: string) {
    callback({
      type: ConsoleType.Warn,
      time: Date.now(),
      value: text,
    });
    console.defaultWarn.apply(console, arguments);
  };
  console.defaultDebug = console.debug.bind(console);
  console.debug = function (text: string) {
    callback({
      type: ConsoleType.Debug,
      time: Date.now(),
      value: text,
    });
    console.defaultDebug.apply(console, arguments);
  };
};

export const initResourceListeners = () => {
  setTimeout(() => {
    var resources = window.performance.getEntriesByType('resource');
    for (var i = 0; i < resources.length; i++) {
      console.log(resources[i]);
    }
  }, 4000);
};
