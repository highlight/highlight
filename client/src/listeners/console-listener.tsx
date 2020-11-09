export type ConsoleMessage = {
  value: string;
  time: number;
  type: string;
};

// taken from: https://stackoverflow.com/questions/19846078/how-to-read-from-chromes-console-in-javascript
export const ConsoleListener = (callback: (c: ConsoleMessage) => void) => {
  console.defaultLog = console.log.bind(console);
  console.log = function (text: string) {
    callback({
      type: 'Log',
      time: Date.now(),
      value: text,
    });
    console.defaultLog.apply(console, arguments);
  };
  console.defaultError = console.error.bind(console);
  console.error = function (text: string) {
    callback({
      type: 'Error',
      time: Date.now(),
      value: text,
    });
    console.defaultError.apply(console, arguments);
  };
  console.defaultWarn = console.warn.bind(console);
  console.warn = function (text: string) {
    callback({
      type: 'Warn',
      time: Date.now(),
      value: text,
    });
    console.defaultWarn.apply(console, arguments);
  };
  console.defaultDebug = console.debug.bind(console);
  console.debug = function (text: string) {
    callback({
      type: 'Debug',
      time: Date.now(),
      value: text,
    });
    console.defaultDebug.apply(console, arguments);
  };
};
