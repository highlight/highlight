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
                console.log(result);
                callback({
                    event: event,
                    type: 'exception',
                    source: source,
                    lineno: result[0].lineNumber,
                    colno: result[0].columnNumber,
                    trace: result,
                });
            });
        }
    };
};

export const ErrorStringify = (object: any) => {
    return JSON.stringify(object, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
};
