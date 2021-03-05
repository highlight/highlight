import { ErrorMessage } from '../../../frontend/src/util/shared-types';
import StackTrace from 'stacktrace-js';

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
    window.onerror = (
        event: any,
        source: string | undefined,
        lineno: number | undefined,
        colno: number | undefined,
        error: Error | undefined
    ): void => {
        if (error) {
            StackTrace.fromError(error).then((result) => {
                console.log('result', result);
                callback({
                    event: JSON.stringify(event),
                    type: 'exception',
                    url: window.location.href,
                    source: source ? source : '',
                    lineNumber: result[0].lineNumber ? result[0].lineNumber : 0,
                    columnNumber: result[0].columnNumber
                        ? result[0].columnNumber
                        : 0,
                    trace: result,
                });
            });
        }
    };
};
