import StackTrace from 'stacktrace-js';
export declare type ConsoleMessage = {
    value?: Array<any> | string;
    time: number;
    type: string;
    trace?: StackTrace.StackFrame[];
};
export declare type ErrorMessage = {
    event: string;
    type: 'console.error' | 'window.onerror' | 'custom';
    url: string;
    source: string;
    lineNumber: number;
    columnNumber: number;
    trace: StackTrace.StackFrame[];
    /** The Unix Time of when the error was thrown. */
    timestamp: string;
    payload?: string;
};
export declare type NetworkResourceContent = {
    endTime?: number;
    request?: HookRequest;
    response?: HookResponse;
};
export declare type HookRequest = {
    method: string;
    url: string;
    body: string;
    headers: string;
    timeout: number;
    type: string;
    withCredentials: string;
};
export declare type HookResponse = {
    status: string;
    statusText: string;
    text: string;
    headers: string;
    xml: any;
    data: any;
};
