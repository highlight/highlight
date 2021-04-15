import { ConsoleMessage } from '../../../frontend/src/util/shared-types';
import StackTrace from 'stacktrace-js';

// taken from: https://stackoverflow.com/questions/19846078/how-to-read-from-chromes-console-in-javascript
export const ConsoleListener = (callback: (c: ConsoleMessage) => void) => {
    console.defaultLog = console.log.bind(console);
    console.log = function () {
        callback({
            type: 'Log',
            time: Date.now(),
            value: Array.from(arguments),
        });
        console.defaultLog.apply(console, arguments);
    };
    console.defaultError = console.error.bind(console);
    console.error = function () {
        const errorArgs = arguments;
        StackTrace.get().then((result) => {
            callback({
                type: 'Error',
                time: Date.now(),
                value: Array.from(errorArgs),
                trace: result.slice(1),
            });
        });
        console.defaultError.apply(console, arguments);
    };
    console.defaultWarn = console.warn.bind(console);
    console.warn = function () {
        callback({
            type: 'Warn',
            time: Date.now(),
            value: Array.from(arguments),
        });
        console.defaultWarn.apply(console, arguments);
    };
    console.defaultDebug = console.debug.bind(console);
    console.debug = function () {
        callback({
            type: 'Debug',
            time: Date.now(),
            value: Array.from(arguments),
        });
        console.defaultDebug.apply(console, arguments);
    };
    return () => {
        console.debug = console.defaultDebug;
        console.warn = console.defaultWarn;
        console.error = console.defaultError;
        console.log = console.defaultLog;
    };
};
