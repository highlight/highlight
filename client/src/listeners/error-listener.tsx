import { ErrorMessage } from '../../../frontend/src/util/shared-types';

export const ErrorListener = (callback: (e: ErrorMessage) => void) =>{
    window.onerror = (event: string | Event, source?: string | undefined, lineno?: number | undefined, colno?: number | undefined, error?: Error | undefined): void => {
        callback({
            event: event,
            source: source,
            lineno: lineno,
            colno: colno,
            error: error
          });
    }
}
