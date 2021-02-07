import { ErrorMessage } from '../../../frontend/src/util/shared-types';

export const ErrorListener = (callback: (e: ErrorMessage) => void) => {
    window.onerror = (
        event: string | Event,
        source?: string | undefined,
        lineno?: number | undefined,
        colno?: number | undefined,
        trace?: Error | undefined
    ): void => {
        callback({
            event: event,
            type: 'exception',
            source: source,
            lineno: BigInt(String(lineno)),
            colno: BigInt(String(colno)),
            trace: String(trace),
        });
    };
};

export const ErrorStringify = (object: any) => {
    return JSON.stringify(object, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
};
