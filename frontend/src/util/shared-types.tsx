export type ConsoleMessage = {
    value: string;
    time: number;
    type: string;
};

export type NetworkResourceContent = {
    startTime: number;
    endTime?: number;
    url?: string;
    request?: any;
    response?: Response;
    responseBody?: string;
    // check this field for error.
    errorContent?: any;
};

export type Header = {
    key: string;
    value: string;
};

export type Response = {
    status: number;
    statusText: string;
    type: ResponseType;
    ok: boolean;
    redirected: boolean;
    headers?: Array<Header>;
};
