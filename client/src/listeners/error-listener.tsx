import { ErrorMessage } from '../../../frontend/src/util/shared-types';
import stringify from 'json-stringify-safe';
import ErrorStackParser from 'error-stack-parser';

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
    const initialOnError = window.onerror;
    window.onerror = (
        event: any,
        source: string | undefined,
        lineno: number | undefined,
        colno: number | undefined,
        error: Error | undefined
    ): void => {
        if (error) {
            let res: ErrorStackParser.StackFrame[] = [];

            try {
                res = ErrorStackParser.parse(error);
            } catch {} // @eslint-ignore
            callback({
                event: stringify(event),
                type: 'window.onerror',
                url: window.location.href,
                source: source ? source : '',
                lineNumber: res[0]?.lineNumber ? res[0]?.lineNumber : 0,
                columnNumber: res[0]?.columnNumber ? res[0]?.columnNumber : 0,
                stackTrace: res,
                timestamp: new Date().toISOString(),
            });
        }
    };
    return () => {
        window.onerror = initialOnError;
    };
};
