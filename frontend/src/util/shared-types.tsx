import StackTrace from 'stacktrace-js';

export type ConsoleMessage = {
    value?: string;
    time: number;
    type: string;
    trace?: StackTrace.StackFrame[];
};

export type ErrorMessage = {
    event: string;
    type: 'console' | 'exception';
    source: string;
    lineNumber: number;
    columnNumber: number;
    trace: StackTrace.StackFrame[];
};

export type NetworkResourceContent = {
    endTime?: number;
    request?: HookRequest;
    response?: HookResponse;
};

export type HookRequest = {
    method: string;
    url: string;
    body: string;
    headers: string;
    timeout: number;
    type: string;
    withCredentials: string;
};

export type HookResponse = {
    status: string;
    statusText: string;
    text: string;
    headers: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
};
