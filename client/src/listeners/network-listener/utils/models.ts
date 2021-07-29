export interface Headers {
    [key: string]: any;
}

export interface Request {
    url: string;
    verb: string;
    headers?: Headers;
    body: any;
}

export interface Response {
    status: number;
    headers: any;
    body: any;
    /** Number of Bytes transferred over the network. */
    size?: number;
}

export interface RequestResponsePair {
    request: Request;
    response: Response;
    /** Whether this URL matched a `urlToBlock` so the contents should not be recorded. */
    urlBlocked: boolean;
}
