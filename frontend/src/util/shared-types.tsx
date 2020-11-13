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
