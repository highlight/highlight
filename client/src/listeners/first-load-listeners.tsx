import {
    ALL_CONSOLE_METHODS,
    ConsoleListener,
    ConsoleMethods,
} from './console-listener';
import { ErrorListener } from './error-listener';

import {
    ConsoleMessage,
    ErrorMessage,
} from '../../../frontend/src/util/shared-types';
import {
    ERRORS_TO_IGNORE,
    ERROR_PATTERNS_TO_IGNORE,
} from '../constants/errors';

export class FirstLoadListeners {
    disableConsoleRecording: boolean;
    consoleMethodsToRecord: ConsoleMethods[];
    listeners: listenerHandler[];
    errors: ErrorMessage[];
    messages: ConsoleMessage[];

    constructor({ options }: { options: HighlightClassOptions }) {
        this.disableConsoleRecording =
            // Disable recording the console on localhost.
            // We're doing this because on some development builds, the console ends up in an infinite loop.
            window.location.hostname === 'localhost' ||
            !!options.disableConsoleRecording;
        this.consoleMethodsToRecord = options.consoleMethodsToRecord || [
            ...ALL_CONSOLE_METHODS,
        ];
        this.listeners = [];
        this.errors = [];
        this.messages = [];
    }

    isListening() {
        return this.listeners.length > 0;
    }

    startListening() {
        if (this.isListening()) return;
        const highlightThis = this;
        if (!this.disableConsoleRecording) {
            this.listeners.push(
                ConsoleListener(
                    (c: ConsoleMessage) => {
                        if (
                            (c.type === 'Error' || c.type === 'error') &&
                            c.value &&
                            c.trace
                        ) {
                            const errorValue = stringify(c.value);
                            if (
                                ERRORS_TO_IGNORE.includes(errorValue) ||
                                ERROR_PATTERNS_TO_IGNORE.some((pattern) =>
                                    errorValue.includes(pattern)
                                )
                            ) {
                                return;
                            }
                            highlightThis.errors.push({
                                event: errorValue,
                                type: 'console.error',
                                url: window.location.href,
                                source: c.trace[0]?.fileName
                                    ? c.trace[0].fileName
                                    : '',
                                lineNumber: c.trace[0]?.lineNumber
                                    ? c.trace[0].lineNumber
                                    : 0,
                                columnNumber: c.trace[0]?.columnNumber
                                    ? c.trace[0].columnNumber
                                    : 0,
                                stackTrace: c.trace,
                                timestamp: new Date().toISOString(),
                            });
                        } else {
                            highlightThis.messages.push(c);
                        }
                    },
                    {
                        lengthThreshold: 1000,
                        level: this.consoleMethodsToRecord,
                        logger: 'console',
                        stringifyOptions: {
                            depthOfLimit: 10,
                            numOfKeysLimit: 100,
                            stringLengthLimit: 1000,
                        },
                    }
                )
            );
        }
        this.listeners.push(
            ErrorListener((e: ErrorMessage) => highlightThis.errors.push(e))
        );
    }

    stopListening() {
        this.listeners.forEach((stop: listenerHandler) => stop());
        this.listeners = [];
    }
}
